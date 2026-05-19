from django.contrib import admin

from .models import (
    Module,
    Matiere,
    Filiere,
    CollecteNote,
    StudentNote,
)


admin.site.register(Module)
admin.site.register(Matiere)
admin.site.register(Filiere)
admin.site.register(CollecteNote)
admin.site.register(StudentNote)