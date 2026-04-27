import os
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from newspaper import Article, Config

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def ask_ai(prompt):
    api_key = os.getenv("GROQ_API_KEY") # .env에 저장하신 키!
    url = "https://api.groq.com/openai/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}]
    }
    
    response = requests.post(url, headers=headers, json=data)
    result = response.json()
    
    if response.status_code == 200:
        return result['choices'][0]['message']['content']
    else:
        print(f"🔴 AI 에러 응답: {result}")
        raise Exception("AI 번역 실패")

@app.get("/upgrade-existing")
def upgrade_existing():
    articles = supabase.table("articles").select("*").execute().data
    updated_count = 0
    
    config = Config()
    config.browser_user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

    for item in articles:
        try:
            news = Article(item['url'], config=config)
            news.download()
            news.parse()
            
            full_text = news.text[:1500] if news.text else item['title']
            prompt = f"너는 뉴스 에디터야. 다음 내용을 한국어로만 번역하고 한 문장으로 요약해줘. 한자(Chinese characters)는 절대 쓰지 말고 오직 한글로만 작성해줘: {full_text}"
            
            # 💡 여기서 ask_ai를 호출해야 합니다!
            translated_text = ask_ai(prompt)
            
            supabase.table("articles").update({
                "summary": translated_text,
                "image": news.top_image if news.top_image else item['image']
            }).eq("id", item['id']).execute()
            
            updated_count += 1
            print(f"✅ {item['id']}번 번역 완료!")
            
        except Exception as e:
            print(f"❌ {item['id']}번 실패: {str(e)}")
            
    return {"status": "success", "updated": updated_count}

@app.get("/articles")
def get_articles():
    return supabase.table("articles").select("*").order("id", desc=True).execute().data