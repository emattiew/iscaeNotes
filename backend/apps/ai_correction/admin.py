from django.contrib import admin


from .models import Exam, ExamQuestion, ExamCopy

admin.site.register(Exam)
admin.site.register(ExamQuestion)
admin.site.register(ExamCopy)