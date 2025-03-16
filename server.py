from flask import Flask, render_template, send_file
import os
from collections import defaultdict, Counter
from datetime import datetime, timedelta
import pandas as pd

app = Flask(__name__)
folder = '/home/iservice4070/NeuroAvatar/outputs'

def generate_detailed_report():
    daily_report = defaultdict(int)
    weekday_counter = Counter()
    monthly_counter = defaultdict(int)
    user_weekly = Counter()
    daily_users = defaultdict(set)

    today = datetime.now()
    week_ago = today - timedelta(days=7)

    for filename in os.listdir(folder):
        if not filename.startswith('output-'):
            continue

        parts = filename.rsplit('-', 1)
        if len(parts) < 2 or len(parts[1]) < 8:
            continue

        user_id = parts[0].replace('output-', '')
        timestamp = parts[1][:8]

        try:
            date = datetime.strptime(timestamp, '%Y%m%d')
        except ValueError:
            continue

        formatted_date = date.strftime('%Y-%m-%d')

        daily_report[formatted_date] += 1
        weekday_counter[date.strftime('%A')] += 1
        monthly_counter[date.strftime('%Y-%m')] += 1

        daily_users[formatted_date].add(user_id)

        if date >= week_ago:
            user_weekly[user_id] += 1

    sorted_daily = sorted(daily_report.items())
    sorted_weekdays = weekday_counter.most_common()
    sorted_monthly = sorted(monthly_counter.items())

    total_files = sum(daily_report.values())
    average_per_day = round(total_files / len(daily_report), 2) if daily_report else 0

    top_days = sorted(daily_report.items(), key=lambda x: x[1], reverse=True)[:5]
    low_days = sorted(daily_report.items(), key=lambda x: x[1])[:5]

    last_7_days = []
    for i in reversed(range(7)):
        day = (today - timedelta(days=i)).strftime('%Y-%m-%d')
        files_count = daily_report.get(day, 0)
        users_count = len(daily_users.get(day, set()))
        last_7_days.append((day, files_count, users_count))

    top_users_week = user_weekly.most_common(5)

    return {
        'daily': sorted_daily,
        'weekdays': sorted_weekdays,
        'monthly': sorted_monthly,
        'total_files': total_files,
        'average_per_day': average_per_day,
        'top_days': top_days,
        'low_days': low_days,
        'last_7_days': last_7_days,
        'top_users_week': top_users_week
    }

@app.route('/', methods=['GET'])
def detailed_report():
    stats = generate_detailed_report()
    return render_template('detailed_report.html', stats=stats)

@app.route('/export')
def export():
    stats = generate_detailed_report()
    df = pd.DataFrame(stats['daily'], columns=['Дата', 'Файлов за день'])
    file_path = 'report.xlsx'
    df.to_excel(file_path, index=False)
    return send_file(file_path, as_attachment=True, download_name='statistics.xlsx')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

