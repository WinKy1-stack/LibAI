from google import genai

client = genai.Client(api_key="AIzaSyCP-JRqHygkBip6dCB7YE3NZoeEXAi-tzs")

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="How does AI work?"
)
print(response.text)