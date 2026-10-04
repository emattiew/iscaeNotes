from django.test import TestCase

from .models import Module


class ModuleModelTest(TestCase):

    def test_module_creation(self):
        module = Module.objects.create(
            name="Test Module",
            semestre=1
        )

        self.assertEqual(module.name, "Test Module")
        self.assertEqual(module.semestre, 1)
        self.assertEqual(str(module), "Test Module - S1")