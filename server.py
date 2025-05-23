from flask import Flask, render_template, send_file, jsonify
import os
from dotenv import load_dotenv
from collections import defaultdict, Counter
from datetime import datetime, timedelta
import pandas as pd

app = Flask(__name__)
load_dotenv()
folder = os.getenv('PHOTO_FOLDER_PATH', '/home/iservice4070/NeuroAvatar/outputs')  # ← путь к каталогу с файлами

# ----------------------------------------------------------------------
#  ФУНКЦИЯ СВОДНОЙ СТАТИСТИКИ
# ----------------------------------------------------------------------
def generate_detailed_report(start_date_str=None, end_date_str=None):
    report_start_date = None
    report_end_date = None

    if start_date_str:
        try:
            report_start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        except ValueError:
            # Log error or handle, for now, proceed as if no date was given
            print(f"Error parsing start_date_str: {start_date_str}")
            pass # report_start_date remains None

    if end_date_str:
        try:
            # Parse and make it inclusive of the entire day
            report_end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        except ValueError:
            # Log error or handle
            print(f"Error parsing end_date_str: {end_date_str}")
            pass # report_end_date remains None


    daily_report = defaultdict(int)      # YYYY-MM-DD → файлов
    user_activity_in_range  = Counter()  # user_id    → файлов (custom range)
    daily_users  = defaultdict(set)      # YYYY-MM-DD → {user_id}
    
    hourly_distribution = [0] * 24       # Index 0-23 for hours
    day_of_week_distribution = [0] * 7   # Index 0-6 for Mon-Sun

    today    = datetime.now()
    # week_ago = today - timedelta(days=7) # Will be adjusted or used differently

    first_file_date = None
    last_file_date = None

    for filename in os.listdir(folder):
        if not filename.startswith('output-'):
            continue

        parts = filename.rsplit('-', 1)
        if len(parts) < 2 or len(parts[1]) < 8:
            continue

        user_id   = parts[0].replace('output-', '')
        timestamp = parts[1][:8]                      # YYYYMMDD
        try:
            file_date_obj = datetime.strptime(timestamp, '%Y%m%d')
        except ValueError:
            continue

        # Apply date filtering
        if report_start_date and file_date_obj < report_start_date:
            continue
        if report_end_date and file_date_obj > report_end_date: # file_date_obj is at 00:00, report_end_date is at 00:00
            continue

        if first_file_date is None or file_date_obj < first_file_date:
            first_file_date = file_date_obj
        if last_file_date is None or file_date_obj > last_file_date:
            last_file_date = file_date_obj
        
        # Populate aggregated activity patterns
        day_of_week_distribution[file_date_obj.weekday()] += 1
        
        # Attempt to parse hour from the filename part parts[1]
        # parts[1] could be like '2023010100.jpg' or '20230101000000.jpg' etc.
        if len(parts[1]) >= 10: # Need at least YYYYMMDDHH
            hour_str = parts[1][8:10]
            if hour_str.isdigit():
                hour = int(hour_str)
                if 0 <= hour <= 23:
                    hourly_distribution[hour] += 1

        formatted_date = file_date_obj.strftime('%Y-%m-%d')
        daily_report[formatted_date] += 1
        daily_users [formatted_date].add(user_id)
        user_activity_in_range[user_id] += 1


    # Determine effective dates for the report
    effective_start_date = report_start_date if report_start_date else first_file_date
    effective_end_date = report_end_date if report_end_date else last_file_date

    total_files = sum(daily_report.values())
    
    num_days_in_range = 0
    if effective_start_date and effective_end_date:
        num_days_in_range = (effective_end_date - effective_start_date).days + 1
    elif daily_report: # Fallback if only one of the dates or no dates specified, use actual data span
        sorted_dates = sorted([datetime.strptime(d, '%Y-%m-%d') for d in daily_report.keys()])
        if sorted_dates:
            num_days_in_range = (sorted_dates[-1] - sorted_dates[0]).days + 1
            if not effective_start_date: effective_start_date = sorted_dates[0]
            if not effective_end_date: effective_end_date = sorted_dates[-1]


    average_per_day = round(total_files / num_days_in_range, 2) if num_days_in_range > 0 else 0

    last_7_days = []
    for i in reversed(range(7)):
        day = (today - timedelta(days=i)).strftime('%Y-%m-%d')
        count_for_day = 0
        users_for_day = set()
        # Check if this day falls within the effective range if a range is set
        current_day_dt = datetime.strptime(day, '%Y-%m-%d')
        if effective_start_date and effective_end_date:
            if effective_start_date <= current_day_dt <= effective_end_date:
                count_for_day = daily_report.get(day, 0)
                users_for_day = daily_users.get(day, set())
        elif not report_start_date and not report_end_date: # Only if no range is specified
             count_for_day = daily_report.get(day, 0)
             users_for_day = daily_users.get(day, set())
        
        last_7_days.append((day, count_for_day, len(users_for_day)))


    last_30_days = []
    for i in reversed(range(30)):
        day = (today - timedelta(days=i)).strftime('%Y-%m-%d')
        count_for_day = 0
        users_for_day = set()
        current_day_dt = datetime.strptime(day, '%Y-%m-%d')
        if effective_start_date and effective_end_date:
            if effective_start_date <= current_day_dt <= effective_end_date:
                count_for_day = daily_report.get(day, 0)
                users_for_day = daily_users.get(day, set())
        elif not report_start_date and not report_end_date: # Only if no range is specified
             count_for_day = daily_report.get(day, 0)
             users_for_day = daily_users.get(day, set())

        last_30_days.append((day, count_for_day, len(users_for_day)))

    # Sort daily_report by date for consistent output
    # Filter daily_report to only include items within the effective range for the 'daily' list
    filtered_daily_items = []
    if daily_report:
        for date_str, count in sorted(daily_report.items()):
            item_date = datetime.strptime(date_str, '%Y-%m-%d')
            if effective_start_date and item_date < effective_start_date:
                continue
            if effective_end_date and item_date > effective_end_date:
                continue
            filtered_daily_items.append((date_str, count))

    daily_user_counts_list = []
    total_user_interactions_in_range = 0
    # daily_users is already filtered by the date range as it's populated with file_date_obj within the range
    for date_key in daily_report.keys(): # Iterate over keys that are confirmed to be in range and have activity
        total_user_interactions_in_range += len(daily_users[date_key])
        # For daily_user_counts_list, ensure we only use dates from filtered_daily_items
        # This check is implicitly handled if filtered_daily_items is the source of date_str
        
    # Rebuild daily_user_counts_list based on filtered_daily_items to ensure alignment
    daily_user_counts_list = []
    for date_str, _ in filtered_daily_items:
        user_count_for_day = len(daily_users.get(date_str, set()))
        daily_user_counts_list.append([date_str, user_count_for_day])

    # Calculate new unique users per day for the filtered range
    seen_users_in_period = set()
    new_unique_users_per_day_list = []
    # daily_users contains all users active on a given day (YYYY-MM-DD) from the original file scan
    # filtered_daily_items contains [date_str, count] for days within the effective report range, sorted.
    for date_str, _ in filtered_daily_items: # Iterate by sorted, filtered dates
        current_day_users = daily_users.get(date_str, set())
        new_users_for_this_day = current_day_users - seen_users_in_period
        new_unique_users_per_day_list.append([date_str, len(new_users_for_this_day)])
        seen_users_in_period.update(current_day_users)


    return {
        'daily'          : filtered_daily_items, # Use filtered and sorted items
        'total_files'    : total_files,
        'average_per_day': average_per_day,
        'last_7_days'    : last_7_days,
        'last_30_days'   : last_30_days,
        'top_users_in_range' : user_activity_in_range.most_common(10),
        'effective_start_date': effective_start_date.strftime('%Y-%m-%d') if effective_start_date else None,
        'effective_end_date': effective_end_date.strftime('%Y-%m-%d') if effective_end_date else None,
        'daily_user_counts': daily_user_counts_list,
        'hourly_distribution': hourly_distribution,
        'day_of_week_distribution': day_of_week_distribution,
        # 'all_user_activity_list': sorted(user_activity_in_range.items(), key=lambda item: item[0]), # No longer needed
        'unique_users_count_in_range': len(user_activity_in_range),
        'total_user_interactions_in_range': total_user_interactions_in_range,
        'new_unique_users_per_day': new_unique_users_per_day_list,
    }

# ----------------------------------------------------------------------
#  ROUTES
# ----------------------------------------------------------------------
from flask import request

@app.route('/')
def detailed_report():
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    stats_data = generate_detailed_report(start_date_str, end_date_str)
    return render_template(
        'detailed_report.html',
        stats=stats_data,
        server_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        current_start_date=start_date_str,
        current_end_date=end_date_str
    )

# → CSV-экспорт (остался без изменений)
@app.route('/export')
def export():
    # Pass date range parameters if they exist
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    stats = generate_detailed_report(start_date_str, end_date_str)
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
#  API Endpoint for User-Specific Activity
# ----------------------------------------------------------------------
@app.route('/api/user_activity/<target_user_id>')
def get_user_activity(target_user_id):
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    report_start_date = None
    report_end_date = None

    if start_date_str:
        try:
            report_start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        except ValueError:
            # Log or handle error, for now, treat as no filter
            pass 
    if end_date_str:
        try:
            report_end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        except ValueError:
            pass

    user_total_files = 0
    user_daily_activity = defaultdict(int)  # date_str -> count
    user_hourly_distribution = [0] * 24
    user_day_of_week_distribution = [0] * 7 # Mon-Sun

    for filename in os.listdir(folder):
        if not filename.startswith(f'output-{target_user_id}-'):
            continue

        parts = filename.rsplit('-', 1)
        if len(parts) < 2 or len(parts[1]) < 8: # Need at least YYYYMMDD
            continue
        
        # filename_user_id = parts[0].replace('output-', '') # Already filtered by startswith

        timestamp_full_str = parts[1] # e.g., "20230101001010.jpg"
        
        try:
            # For date filtering and daily/DOW aggregation
            file_date_obj = datetime.strptime(timestamp_full_str[:8], '%Y%m%d')
            
            # For hourly aggregation
            file_hour = None
            if len(timestamp_full_str) >= 10: # YYYYMMDDHH
                hour_str = timestamp_full_str[8:10]
                if hour_str.isdigit():
                    h = int(hour_str)
                    if 0 <= h <= 23:
                        file_hour = h
        except ValueError:
            print(f"Skipping file due to timestamp parse error: {filename}")
            continue

        # Apply date filtering
        if report_start_date and file_date_obj < report_start_date:
            continue
        if report_end_date and file_date_obj > report_end_date:
            continue

        user_total_files += 1
        user_daily_activity[file_date_obj.strftime('%Y-%m-%d')] += 1
        if file_hour is not None:
            user_hourly_distribution[file_hour] += 1
        user_day_of_week_distribution[file_date_obj.weekday()] += 1
        
    sorted_daily_activity = sorted(user_daily_activity.items())

    return jsonify({
        'user_id': target_user_id,
        'total_files': user_total_files,
        'daily_activity': sorted_daily_activity,
        'hourly_distribution': user_hourly_distribution,
        'day_of_week_distribution': user_day_of_week_distribution,
        'requested_start_date': start_date_str,
        'requested_end_date': end_date_str
    })

# ----------------------------------------------------------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

