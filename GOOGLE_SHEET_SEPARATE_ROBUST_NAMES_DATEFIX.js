// Student Up - Robust Separate Sheets Version with Student Names & Date Fix
// 增強版：自動建立缺失工作表 + 訓練記錄顯示學員姓名 + 日期格式修正

function doGet(e) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var students = readSheet(getOrCreateSheet(ss, "Students"));

    var workoutsFit = readSheet(getOrCreateSheet(ss, "Workouts_Fitness"));
    var workoutsSwim = readSheet(getOrCreateSheet(ss, "Workouts_Swimming"));
    var workoutsBox = readSheet(getOrCreateSheet(ss, "Workouts_Boxing"));

    var allWorkouts = flattenWorkouts(workoutsFit)
        .concat(flattenWorkouts(workoutsSwim))
        .concat(flattenWorkouts(workoutsBox));

    var assembledStudents = students.map(function (row) {
        return {
            id: row['ID'] || row.id,
            name: row['姓名'] || row.name,
            role: row['角色'] || row.role,
            category: row['分類'] || row.category,
            stats: {
                height: row['身高'] || row.height,
                weight: row['體重'] || row.weight,
                bodyFat: row['體脂'] || row.bodyFat,
                injuries: row['傷病'] || row.injuries,
                goals: row['目標'] || row.goals,
                updatedAt: row['更新時間'] || row.updatedAt
            }
        };
    });

    return ContentService.createTextOutput(JSON.stringify({
        students: assembledStudents,
        workouts: allWorkouts
    })).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(ss, name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
        sheet = ss.insertSheet(name);
    }
    return sheet;
}

function flattenWorkouts(rows) {
    if (!rows) return [];
    return rows.map(function (row) {
        var exercises = [];
        try {
            if (row['raw_json']) {
                var parsed = JSON.parse(row['raw_json']);
                exercises = parsed.exercises || [];
            }
        } catch (e) { }

        // Date cleansing logic (Reading from Sheet)
        var rawDate = row['日期'] || row.date;
        var finalDate = rawDate;
        if (rawDate instanceof Date) {
            finalDate = rawDate.toISOString().split('T')[0];
        } else if (typeof rawDate === 'string' && rawDate.indexOf('T') > -1) {
            finalDate = rawDate.split('T')[0];
        }

        return {
            id: row['ID'] || row.id,
            studentId: row['學員ID'] || row.studentId,
            date: finalDate, // Clean date
            coachNotes: row['教練筆記'] || row.coachNotes,
            exercises: exercises,
            recordedStats: {
                weight: row['記錄體重'] || row.stat_weight,
                bodyFat: row['記錄體脂'] || row.stat_bodyFat,
                injuries: row['記錄傷病'] || row.stat_injuries
            }
        };
    });
}

function doPost(e) {
    try {
        var jsonString = e.postData.contents;
        var data = JSON.parse(jsonString);
        var ss = SpreadsheetApp.getActiveSpreadsheet();

        // 建立 ID 對照 姓名的 Map，讓訓練記錄可以填入正確姓名
        var studentNameMap = {};
        if (data.students) {
            data.students.forEach(function (s) {
                studentNameMap[s.id] = s.name;
            });
            saveStudentsChinese(getOrCreateSheet(ss, "Students"), data.students);
        }

        if (data.workouts) {
            var fit = [], swim = [], box = [];
            data.workouts.forEach(function (w) {
                var first = (w.exercises && w.exercises[0]) || {};
                if (first.stroke) swim.push(w);
                else if (first.isStrengthTraining !== undefined) box.push(w);
                else fit.push(w);
            });

            // 傳入 studentNameMap
            if (fit.length > 0) saveWorkoutsChinese(getOrCreateSheet(ss, "Workouts_Fitness"), fit, "Fitness", studentNameMap);
            if (swim.length > 0) saveWorkoutsChinese(getOrCreateSheet(ss, "Workouts_Swimming"), swim, "Swimming", studentNameMap);
            if (box.length > 0) saveWorkoutsChinese(getOrCreateSheet(ss, "Workouts_Boxing"), box, "Boxing", studentNameMap);
        }

        return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function readSheet(sheet) {
    if (!sheet) return [];
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rows = data.slice(1);
    var result = [];

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var item = {};
        for (var j = 0; j < headers.length; j++) {
            item[headers[j]] = row[j];
        }
        result.push(item);
    }
    return result;
}

function saveStudentsChinese(sheet, students) {
    if (!students || students.length === 0) return;
    var headers = ['ID', '姓名', '角色', '分類', '身高', '體重', '體脂', '傷病', '目標', '更新時間'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    var rows = students.map(function (s) {
        var st = s.stats || {};
        return [s.id, s.name, s.role, s.category, st.height, st.weight, st.bodyFat, st.injuries, st.goals, st.updatedAt];
    });
    writeToSheet(sheet, headers, rows);
}

function saveWorkoutsChinese(sheet, workouts, type, nameMap) {
    if (!workouts || workouts.length === 0) return;

    // 新增 '姓名' 欄位
    var headers = [
        'ID', '學員ID', '姓名', '日期', '教練筆記',
        '訓練摘要',
        '記錄體重', '記錄體脂', '記錄傷病',
        'raw_json'
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.hideColumns(headers.length);

    var rows = workouts.map(function (w) {
        var stats = w.recordedStats || {};
        var exercises = w.exercises || [];
        var summary = "";
        // 查找學生姓名，如果找不到則留空
        var studentName = nameMap ? (nameMap[w.studentId] || "") : "";

        if (exercises.length > 0) {
            if (type === "Swimming") {
                summary = exercises.map(function (e) { return "[" + e.stroke + "] " + (e.progress || ""); }).join("\n");
            } else if (type === "Boxing") {
                summary = exercises.map(function (e) { return (e.isStrengthTraining ? "[肌力] " : "[技術] ") + (e.combinations || ""); }).join("\n");
            } else {
                summary = exercises.map(function (e) { return e.name + ": " + e.weight + "kg x " + e.reps + " x " + e.sets; }).join("\n");
            }
        }

        // Clean Date for writing
        var dateStr = w.date;
        if (dateStr && typeof dateStr === 'string' && dateStr.indexOf('T') > -1) {
            dateStr = dateStr.split('T')[0];
        }

        var rawJson = JSON.stringify({ exercises: w.exercises });
        return [
            w.id, w.studentId, studentName, dateStr, w.coachNotes,
            summary,
            stats.weight, stats.bodyFat, stats.injuries,
            rawJson
        ];
    });

    writeToSheet(sheet, headers, rows);
}

function writeToSheet(sheet, headers, rows) {
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, headers.length).clearContent();
    }
    if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
}
