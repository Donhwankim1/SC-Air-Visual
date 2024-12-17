from flask import Flask, render_template, jsonify
from flask_cors import CORS
import requests
import logging

# Flask 앱 생성
app = Flask(__name__, static_folder="static", template_folder="templates")

# CORS 설정
CORS(app, resources={r"/api/*": {"origins": "*"}})

# 로깅 설정
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# API 설정
API_URL = "https://device.iqair.com/v2/670c76b9a4ffdc8b51df87e0"
API_KEY = "20aef44b-76f1-48b0-9110-e90e5e752d0c"


@app.route("/")
def index():
    """메인 페이지 렌더링"""
    return render_template("index.html")


@app.route("/api/data")
def get_data():
    """API 데이터를 가져와 클라이언트에 반환"""
    try:
        # API 호출
        response = requests.get(f"{API_URL}?key={API_KEY}")
        response.raise_for_status()  # HTTP 에러 확인
        data = response.json()

        # JSON 구조에 맞게 데이터 가공
        latest_entry = data.get("historical", {}).get("daily", [{}])[0]  # 가장 최근 데이터 가져오기
        if not latest_entry:
            raise ValueError("No data available in the API response.")

        extracted_data = {
            "pm25": latest_entry.get("pm25", {}).get("aqius", "N/A"),
            "pm10": latest_entry.get("pm10", {}).get("aqius", "N/A"),
            "temperature": latest_entry.get("tp", "N/A"),
            "humidity": latest_entry.get("hm", "N/A"),
            "timestamp": latest_entry.get("ts", "N/A"),
        }

        # 로그 출력
        app.logger.debug(f"API 호출 성공. 데이터: {extracted_data}")

        # 데이터 반환
        return jsonify(extracted_data)

    except requests.RequestException as e:
        # HTTP 요청 에러 처리
        app.logger.error(f"API 호출 실패: {e}")
        return jsonify({"error": "Failed to fetch data from API", "details": str(e)}), 500
    except ValueError as e:
        # 데이터 파싱 에러 처리
        app.logger.error(f"데이터 파싱 실패: {e}")
        return jsonify({"error": "Failed to parse data", "details": str(e)}), 500


# Flask 앱 실행
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
