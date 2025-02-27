from django.db import models

# Create your models here.

class Table(models.Model):
    tableName = models.CharField(
        max_length=255,
        unique=True
    )

    def __str__(self):
        return self.tableName