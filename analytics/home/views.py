from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from rest_framework.response import Response
from rest_framework.views import APIView 
from rest_framework import status
import sqlite3
from django.db import connections, connection, transaction
import pandas as pd
from io import BytesIO
from .serializers import TableSerializer, Table
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('SVG')
from rest_framework.decorators import api_view

def insert_data_from_dataframe(dataframe, table_name, col, database_name='default'):
    try:
        with connections[database_name].cursor() as cursor:
            for index, row in dataframe.iterrows():
                # Construct the INSERT INTO statement
                column_names = ', '.join(col)
                placeholders = ', '.join(['%s'] * len(col))
                insert_sql = f"INSERT INTO {table_name} ({column_names}) VALUES ({placeholders});"
 
                # Execute the INSERT statement with data from the row
                cursor.execute(insert_sql, tuple(row))
 
            # Commit the changes within a transaction
            with transaction.atomic(using=database_name):
                cursor.execute("COMMIT;")
 
        print(f"Data inserted successfully into '{table_name}' in {database_name} database.")
       
 
    except Exception as e:
        print(f"Error inserting data: {e}")

def create_table_dynamically(table_name, fields, database_name='default'):
    try:
        with connections[database_name].cursor() as cursor:
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}';")
            if cursor.fetchone():
                print(f"Table '{table_name}' already exists in {database_name} database.")
                return  
            create_table_sql = f"CREATE TABLE {table_name} ("
            for field_name, field_type in fields.items():
                create_table_sql += f"{field_name} {field_type},"
            create_table_sql = create_table_sql[:-1] + ");"
            print(create_table_sql)
            with transaction.atomic(using=database_name):  
                cursor.execute(create_table_sql)
                return 1
            print(f"Table '{table_name}' created successfully in {database_name} database.")
 
    except sqlite3.Error as e:
        print(f"SQLite3 Error: {e}")
    except Exception as e:
        print(f"Error creating table: {e}")
  
def convert_list_to_fields(field_list):
    field_dict = {}
    for field_name, field_type in field_list:
        if field_type.lower() == 'text':
            field_dict[field_name] = 'TEXT'
        elif field_type.lower() == 'date':
            field_dict[field_name] = 'DATE'
        elif field_type.lower() == 'integer':
            field_dict[field_name] = 'INTEGER'
        elif field_type.lower() == 'real':
            field_dict[field_name] = 'REAL'
        elif field_type.lower() == 'boolean':
            field_dict[field_name] = 'BOOLEAN'
        elif field_type.lower() == 'datetime':
            field_dict[field_name] = 'DATETIME'
        else:
            field_dict[field_name] = 'TEXT'  
    return field_dict
 
def drop_table_dynamically(table_name, database_name='default'):
    try:
        with connections[database_name].cursor() as cursor:
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}';")
            if not cursor.fetchone():
                print(f"Table '{table_name}' does not exist in {database_name} database.")
                return
 
            drop_table_sql = f"DROP TABLE {table_name};"
 
            with transaction.atomic(using=database_name):
                cursor.execute(drop_table_sql)
                return 1
 
            print(f"Table '{table_name}' dropped successfully from {database_name} database.")
 
    except Exception as e:
        print(f"Error dropping table: {e}")


# Create your views here.
class TableCreation(APIView):
    def post(self, request):
        print(request.data)
        tableName = request.data.get('tableName')
        # print('TableName:', tableName)
        file = request.FILES['file']

        serializer = TableSerializer(data = request.data)
        if not serializer.is_valid():
            print(serializer.errors)  # Very important for debugging
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        df = pd.read_excel(file)
        df = pd.DataFrame(df)
        columns = list(df.columns)
        for i in range(len(columns)):
            columns[i] = columns[i].split()
            columns[i] = ''.join(columns[i])
        feilds= {}
        for i in columns:
            feilds[i] = "TEXT"
        tablename=tableName
        flag = drop_table_dynamically(str(tablename))
        print(flag)
        flag = create_table_dynamically(str(tablename),feilds,"default")
        print(flag)
        insert_data_from_dataframe(dataframe=df,table_name=tablename,col = columns,database_name='default')
        return Response()
    
class GetTable(APIView):
    def get(self, request):
        connections = Table.objects.all()
        serializer = TableSerializer(connections,many=True)
        print(serializer.data)
        return Response(serializer.data)
    
class GetTableData(APIView):
    def get(self, request, tableName):
        try:
            print(tableName)
            with connection.cursor() as cursor:
                sql = f"SELECT * FROM {tableName}"
                cursor.execute(sql)
    
                columns = [col[0] for col in cursor.description] #get the column names dynamically
    
                rows = cursor.fetchall()
                table_data = [dict(zip(columns, row)) for row in rows] #convert rows into list of dictionaries with column names as keys
    
            return JsonResponse(table_data, safe=False)
    
        except Exception as e:
            print(f"Error fetching data: {e}")
            return JsonResponse({"error": str(e)}, status=500)
        return Response()
    
@api_view(['POST'])
def table_data_save(request,tableName):
    df = pd.DataFrame(request.data)
    columns = list(df.columns)
    print(df.shape)
    df.drop_duplicates(subset=[columns[0], columns[2]], inplace=True)
    print(df.shape)
    feilds= {}
    for i in columns:
        feilds[i] = "TEXT"
    tablename=tableName
    flag = drop_table_dynamically(str(tablename))
    print(flag)
    flag = create_table_dynamically(str(tablename),feilds,"default")
    print(flag)
    insert_data_from_dataframe(dataframe=df,table_name=tablename,col = columns,database_name='default')
    return Response()


class ExcelDownload(APIView):
    def post(self, request):
        try:
            data = request.data  # Assuming request.data is a list of dictionaries
    
        # print(data)
    
            if not data:  # Handle empty request data
                return HttpResponse("No data provided in the request.", status=400) # Bad Request
    
            df = pd.DataFrame.from_records(data)
            print("Hello")
    

    
            model_name ="_Effort&Estimate"  # More descriptive
            print(model_name)
    
            output = BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name="data")
    
            output.seek(0)
    
            response = HttpResponse(
                output.getvalue(),  # Directly pass the file content
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="{model_name}.xlsx"'
    
            return response
    
        except Exception as e:
            print(f"An error occurred: {e}") # Log the error for debugging
            return HttpResponse(f"An error occurred: {e}", status=500)  # Return error response
 
class CheckDuplicates(APIView):
    def post(self, request):
        df = pd.DataFrame(request.data)
        print(request.data)
        if (df[df.duplicated(['Project', 'Skill'])].empty):
            return Response(0)
        return Response(1)


class Plots(APIView):
    plot = []
    def save_plot_to_bytes(self):
        """Save the current plot to a BytesIO object and return it."""
        buf = BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)  # rewind the buffer to the beginning
        plt.close()  # close the plot to free memory
        return buf.getvalue().decode('latin1')  # encode for 
    
    def countAccountManager(self, data):
        if data['Count'].dtype != 'int64' and data['Count'].dtype != 'float64':  # Check if not numeric
            try:
                data['Count'] = pd.to_numeric(data['Count'], errors='coerce')  # Convert to numeric, handle errors
                for i in range(len(data['Count'])):
                    if (not data['Count'][i]):
                        data['Count'][i] = 0
                print(data['Count'])
                data.dropna(subset=['Count'], inplace=True)  # Remove rows with NaN in 'Count' after conversion
            except Exception as e:
                print(f"Error converting 'Count' to numeric: {e}")
                print("Please check your data and ensure the 'Count' column is numeric or convertible.")
                return  # Exit the function if conversion fails


        # Group by project and sum counts if there are duplicate project entries
        acc_counts = data.groupby('AccountManager')['Count'].sum().reset_index()

        # Sort by count for better visualization (optional)
        acc_counts = acc_counts.sort_values('Count', ascending=False)

        # Create the bar plot
        plt.figure(figsize=(12, 6))  # Adjust figure size for better readability
        
        colors = plt.cm.get_cmap('Paired', len(acc_counts))  # Use a colormap for distinct colors

        bars = plt.bar(acc_counts['AccountManager'], acc_counts['Count'], color=colors(range(len(acc_counts))))

        # Value labels on bars:
        for bar in bars:
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2, height, str(height), ha='center', va='bottom', fontsize=10) # Centered above bar

        plt.xlabel('Account Manager', fontsize=12)
        plt.ylabel('Positions', fontsize=12)
        # plt.title('Project vs Count', fontsize=14)
        plt.xticks(rotation=45, ha='right', fontsize=10)
        plt.tight_layout()

        # Show the plot
        count = self.save_plot_to_bytes()
        self.plot.append({'Number of Positions(Account Manager)': count})

    def countSkill(self, data):
        if data['Count'].dtype != 'int64' and data['Count'].dtype != 'float64':  # Check if not numeric
            try:
                data['Count'] = pd.to_numeric(data['Count'], errors='coerce')  # Convert to numeric, handle errors
                for i in range(len(data['Count'])):
                    if (not data['Count'][i]):
                        data['Count'][i] = 0
                print(data['Count'])
                data.dropna(subset=['Count'], inplace=True)  # Remove rows with NaN in 'Count' after conversion
            except Exception as e:
                print(f"Error converting 'Count' to numeric: {e}")
                print("Please check your data and ensure the 'Count' column is numeric or convertible.")
                return  # Exit the function if conversion fails


        # Group by project and sum counts if there are duplicate project entries
        skill_counts = data.groupby('Skill')['Count'].sum().reset_index()

        # Sort by count for better visualization (optional)
        skill_counts = skill_counts.sort_values('Count', ascending=False)

        # Create the bar plot
        plt.figure(figsize=(12, 6))  # Adjust figure size for better readability
        
        colors = plt.cm.get_cmap('Paired', len(skill_counts))  # Use a colormap for distinct colors

        bars = plt.bar(skill_counts['Skill'], skill_counts['Count'], color=colors(range(len(skill_counts))))

        # Value labels on bars:
        for bar in bars:
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2, height, str(height), ha='center', va='bottom', fontsize=10) # Centered above bar

        plt.xlabel('Skill', fontsize=12)
        plt.ylabel('Positions', fontsize=12)
        # plt.title('Project vs Count', fontsize=14)
        plt.xticks(rotation=45, ha='right', fontsize=10)
        plt.tight_layout()

        # Show the plot
        count = self.save_plot_to_bytes()
        self.plot.append({'Number of Positions (Skill)': count})

    def countField(self, data):
        if data['Count'].dtype != 'int64' and data['Count'].dtype != 'float64':  # Check if not numeric
            try:
                data['Count'] = pd.to_numeric(data['Count'], errors='coerce')  # Convert to numeric, handle errors
                for i in range(len(data['Count'])):
                    if (not data['Count'][i]):
                        data['Count'][i] = 0
                print(data['Count'])
                data.dropna(subset=['Count'], inplace=True)  # Remove rows with NaN in 'Count' after conversion
            except Exception as e:
                print(f"Error converting 'Count' to numeric: {e}")
                print("Please check your data and ensure the 'Count' column is numeric or convertible.")
                return  # Exit the function if conversion fails


        # Group by project and sum counts if there are duplicate project entries
        project_counts = data.groupby('Project')['Count'].sum().reset_index()

        # Sort by count for better visualization (optional)
        project_counts = project_counts.sort_values('Count', ascending=False)

        # Create the bar plot
        plt.figure(figsize=(12, 6))  # Adjust figure size for better readability
        
        colors = plt.cm.get_cmap('Paired', len(project_counts))  # Use a colormap for distinct colors

        bars = plt.bar(project_counts['Project'], project_counts['Count'], color=colors(range(len(project_counts))))

        # Value labels on bars:
        for bar in bars:
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2, height, str(height), ha='center', va='bottom', fontsize=10) # Centered above bar

        plt.xlabel('Project', fontsize=12)
        plt.ylabel('Positions', fontsize=12)
        # plt.title('Project vs Count', fontsize=14)
        plt.xticks(rotation=45, ha='right', fontsize=10)
        plt.tight_layout()

        # Show the plot
        count = self.save_plot_to_bytes()
        self.plot.append({'Number of Positions (Project)': count})

        
        # mandatory = self.save_plot_to_bytes()
        # self.plot.append({'mandatory': mandatory})

    def statusField(self, data):
        data['Status'] = data['Status'].replace('YTP', 'Yet to be Proposed')  # Standardize the label

        # Group by status and count the *unique* projects in each status:
        status_projects = data.groupby('Status')['Project'].nunique().reset_index()

        # Sort by count (optional)
        status_projects = status_projects.sort_values('Project', ascending=False)

        # Create the bar plot
        plt.figure(figsize=(12, 6))  # Adjust figure size as needed

        colors = plt.cm.get_cmap('Paired', len(status_projects))  # Use a colormap for distinct colors

        bars = plt.bar(status_projects['Status'], status_projects['Project'], color=colors(range(len(status_projects))))

        # Value labels on bars:
        for bar in bars:
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2, height, str(height), ha='center', va='bottom', fontsize=10) # Centered above bar

        plt.xlabel('Status', fontsize=12)
        plt.ylabel('Number of Projects', fontsize=12)
        # plt.title('Project vs Count', fontsize=14)
        plt.xticks(rotation=45, ha='right', fontsize=10)

        # plt.bar(status_projects['Status'], status_projects['Project'], color='skyblue')

        # # Customize the plot
        # plt.xlabel('Status', fontsize=12)
        # plt.ylabel('Number of Projects', fontsize=12)  # More descriptive y-axis label
        # plt.title('Number of Projects by Status', fontsize=14)
        # plt.xticks(rotation=45, ha='right', fontsize=10) # Rotate x-axis labels
        plt.tight_layout()  # Adjust layout

        # Show the plot
        status = self.save_plot_to_bytes()
        self.plot.append({'Status': status})


    def get(self, request, tableName):
        self.plot = []
        fields = ['Project', 'AccountManager', 'Skill', 'Count', 'Status']
        try:
            # print(tableName)
            print("hello world")
            with connection.cursor() as cursor:
                data = cursor.execute(f"SELECT Project, AccountManager, Skill, Count, Status FROM {tableName}")
                data = data.fetchall()
                data = pd.DataFrame(data, columns=fields)
                self.countField(data)
                self.countAccountManager(data)
                self.countSkill(data)
                self.statusField(data)


            return JsonResponse({'plots': self.plot})
    
        except Exception as e:
            print(f"Error fetching data: {e}")
            return JsonResponse({"error": str(e)}, status=500)