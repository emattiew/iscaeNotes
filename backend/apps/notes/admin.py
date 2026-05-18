from django.contrib import admin

from .models import (
    Module,
    Matiere,
)

admin.site.register(Module)
admin.site.register(Matiere)