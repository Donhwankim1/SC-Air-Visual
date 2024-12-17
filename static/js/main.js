async function getData() {
    try {
        console.log("Fetching data from API...");

        // API 호출
        const response = await fetch('/api/data');
        console.log("API Response Status:", response.status);

        // 응답 상태 확인
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // JSON 데이터 파싱
        const data = await response.json();
        console.log("Received Data:", data);

        // **Timestamp 데이터 처리 및 DOM 업데이트**
        if (data.timestamp) {
            const localTime = new Date(data.timestamp);
            const year = localTime.getFullYear();
            const month = String(localTime.getMonth() + 1).padStart(2, '0');
            const date = String(localTime.getDate()).padStart(2, '0');
            const hours = String(localTime.getHours()).padStart(2, '0');
            const minutes = String(localTime.getMinutes()).padStart(2, '0');
            const formattedTime = `${year}-${month}-${date} ${hours}:${minutes}`;
            document.getElementById('time').innerText = formattedTime;
        } else {
            console.error("Timestamp data is missing.");
            document.getElementById('time').innerText = "Timestamp: Error";
        }

        // **PM2.5, PM10, 온도, 습도 데이터 처리 및 DOM 업데이트**
        const pm25value = parseFloat(data.pm25 ?? 0);
        const pm10value = parseFloat(data.pm10 ?? 0);
        document.getElementById('pm25a').innerText = `PM2.5: ${pm25value} µg/m³`;
        document.getElementById('pm10a').innerText = `PM10: ${pm10value} µg/m³`;
        document.getElementById('temperature').innerText = `Temperature: ${data.temperature ?? "Error"}°C`;
        document.getElementById('humidity').innerText = `Humidity: ${data.humidity ?? "Error"}%`;

        // **색상 설정 및 상태 메시지 로직**
        let state, bgcolor, pkrecess, pkacademics, g3_5recess, g3_5academics, currentFaceSrc;

        if (pm25value >= 75.01 || pm10value >= 150.01) {
            state = 'Very Unhealthy<br>PM2.5: 75+<br>PM10: 150+';
            bgcolor = 'IndianRed';
            pkrecess = 'Refrain from outside activity';
            pkacademics = 'Refrain from outside activity';
            g3_5recess = 'Refrain from outside activity';
            g3_5academics = 'Refrain from outside activity';
            currentFaceSrc = "/static/veryunhealthyblack.png"; // 경로 수정
        } else if (pm25value >= 35.01 || pm10value >= 80.01) {
            state = 'Unhealthy<br>PM2.5: 36-75<br>PM10: 81-150';
            bgcolor = 'Gold';
            pkrecess = 'Refrain from outside activity';
            pkacademics = 'Refrain from outside activity';
            g3_5recess = 'Go Outside';
            g3_5academics = 'Wear a particulate mask<br>Avoid vigorous activity';
            currentFaceSrc = "/static/unhealthyblack.png"; // 경로 수정
        } else if (pm25value >= 15.01 || pm10value >= 30.01) {
            state = 'Moderate<br>PM2.5: 16-35<br>PM10: 31-80';
            bgcolor = 'LightGreen';
            pkrecess = 'Go Outside';
            pkacademics = 'Wear a particulate mask<br>Avoid vigorous activity';
            g3_5recess = 'Go Outside';
            g3_5academics = 'Go Outside';
            currentFaceSrc = "/static/moderateblack.png"; // 경로 수정
        } else {
            state = 'Good<br>PM2.5: 0-15<br>PM10: 0-30';
            bgcolor = 'SkyBlue';
            pkrecess = 'Go Outside';
            pkacademics = 'Go Outside';
            g3_5recess = 'Go Outside';
            g3_5academics = 'Go Outside';
            currentFaceSrc = "/static/goodblack.png"; // 경로 수정
        }

        // 상태 메시지 및 이미지 업데이트
        document.getElementById('currenttext').innerHTML = state;
        document.getElementById('currentface').src = currentFaceSrc;

        // 배경색과 글자색 업데이트
        document.getElementById('pmcell25a').style.background = bgcolor;
        document.getElementById('pmcell25a').style.color = 'black';
        document.getElementById('pmcell10a').style.background = bgcolor;
        document.getElementById('pmcell10a').style.color = 'black';

        // Recess와 Academics 상태 업데이트
        document.getElementById('currentpkrecess').innerText = pkrecess;
        document.getElementById('currentpkacademics').innerText = pkacademics;
        document.getElementById('currentg3_5recess').innerText = g3_5recess;
        document.getElementById('currentg3_5academics').innerText = g3_5academics;

        // 전체 테이블과 셀의 배경색 변경
        var obj = document.getElementsByClassName('current');
        for (var i = 0; i < obj.length; i++) {
            obj[i].style.backgroundColor = bgcolor;
        }

        var obj = document.getElementsByClassName('gradecell');
        for (var i = 0; i < obj.length; i++) {
            obj[i].style.backgroundColor = bgcolor;
        }

        var obj = document.getElementsByClassName('currenthead');
        for (var i = 0; i < obj.length; i++) {
            obj[i].style.backgroundColor = bgcolor;
        }

    } catch (error) {
        console.error("Error fetching or updating data:", error);

        // 오류 발생 시 기본 메시지 표시
        document.getElementById('time').innerText = 'Error loading time';
        document.getElementById('pm25a').innerText = 'PM2.5: Error';
        document.getElementById('pm10a').innerText = 'PM10: Error';
        document.getElementById('temperature').innerText = 'Temperature: Error';
        document.getElementById('humidity').innerText = 'Humidity: Error';
    }
}

// 데이터 초기 로드 및 주기적 업데이트
window.onload = function() {
    getData();
    setInterval(getData, 10 * 60 * 1000); // 10분 간격으로 업데이트
};
