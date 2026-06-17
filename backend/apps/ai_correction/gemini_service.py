import google.generativeai as genai

from django.conf import settings

genai.configure(
    api_key=settings.GEMINI_API_KEY
)


def test_gemini():

    model = genai.GenerativeModel(
        "gemini-2.5-flash"
    )

    response = model.generate_content(
        "Say hello in French."
    )

    return response.text