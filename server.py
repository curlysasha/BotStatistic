from flask import Flask, render_template, send_file, jsonify
import os
from collections import defaultdict, Counter
from datetime import datetime, timedelta
import pandas as pd

app = Flask(__name__)
folder = '/home/iservice4070/NeuroAvatar/outputs'  # ← путь к каталогу с файлами

# ----------------------------------------------------------------------
#  ФУНКЦИЯ СВОДНОЙ СТАТИСТИКИ
# ----------------------------------------------------------------------
def generate_detailed_report():
    daily_report = defaultdict(int)      # YYYY-MM-DD → файлов
    user_weekly  = Counter()             # user_id    → файлов (7 дней)
    daily_users  = defaultdict(set)      # YYYY-MM-DD → {user_id}

    today    = datetime.now()
    week_ago = today - timedelta(days=7)

    for filename in os.listdir(folder):
        if not filename.startswith('output-'):
            continue

        parts = filename.rsplit('-', 1)
        if len(parts) < 2 or len(parts[1]) < 8:
            continue

        user_id   = parts[0].replace('output-', '')
        timestamp = parts[1][:8]                      # YYYYMMDD
        try:
            date = datetime.strptime(timestamp, '%Y%m%d')
        except ValueError:
            continue

        formatted_date = date.strftime('%Y-%m-%d')
        daily_report[formatted_date] += 1
        daily_users [formatted_date].add(user_id)

        if date >= week_ago:
            user_weekly[user_id] += 1

    total_files     = sum(daily_report.values())
    average_per_day = round(total_files / len(daily_report), 2) if daily_report else 0

    last_7_days = []
    for i in reversed(range(7)):
        day = (today - timedelta(days=i)).strftime('%Y-%m-%d')
        last_7_days.append((day,
                            daily_report.get(day, 0),
                            len(daily_users.get(day, set()))))

    last_30_days = []
    for i in reversed(range(30)):
        day = (today - timedelta(days=i)).strftime('%Y-%m-%d')
        last_30_days.append((day,
                             daily_report.get(day, 0),
                             len(daily_users.get(day, set()))))

    return {
        'daily'          : sorted(daily_report.items()),
        'total_files'    : total_files,
        'average_per_day': average_per_day,
        'last_7_days'    : last_7_days,
        'last_30_days'   : last_30_days,
        'top_users_week' : user_weekly.most_common(10)   # ← теперь 10 лидеров
    }

# ----------------------------------------------------------------------
#  ROUTES
# ----------------------------------------------------------------------
@app.route('/')
def detailed_report():
    return render_template(
        'detailed_report.html',
        stats=generate_detailed_report(),
        server_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    )

# → CSV-экспорт (остался без изменений)
@app.route('/export')
def export():
    stats = generate_detailed_report()
    df = pd.DataFrame(stats['daily'], columns=['Дата', 'Файлов за день'])
    file_path = 'report.xlsx'
    df.to_excel(file_path, index=False)
    return send_file(file_path, as_attachment=True, download_name='statistics.xlsx')

# → Drill-down: количество файлов по часам выбранного дня
@app.route('/day/<date_str>')
def day_detail(date_str):
    """Возвращает JSON со списком из 24 чисел (файлы по часам)."""
    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Неверный формат даты'}), 400

    hourly = [0] * 24
    for filename in os.listdir(folder):
        if not filename.startswith('output-'):
            continue
        digits = ''.join(ch for ch in filename.rsplit('-', 1)[-1] if ch.isdigit())
        if len(digits) < 10:                   # YYYYMMDDHH
            continue
        try:
            file_dt = datetime.strptime(digits[:10], '%Y%m%d%H')
        except ValueError:
            continue
        if file_dt.date() == target_date:
            hourly[file_dt.hour] += 1

    return jsonify({'date': date_str, 'hourly': hourly})

# → Текущее серверное время (AJAX-обновление)
@app.route('/server_time')
def server_time():
    return jsonify({'now': datetime.now().strftime('%Y-%m-%d %H:%M:%S')})

# ----------------------------------------------------------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

