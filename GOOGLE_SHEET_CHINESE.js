// Student Up - Chinese Headers Version
// 繁體中文欄位表頭版

function doGet(e) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var students = readSheet(ss.getSheetByName("Students"));
    var workouts = readSheet(ss.getSheetByName("Workouts"));

    // 組裝學員資料 (把中文欄位對應回英文物件)
    var assembledStudents = students.map(function (row) {
        return {
            id: row['ID'] || row.id, // 相容處理
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

    // 組裝訓練資料
    var assembledWorkouts = workouts.map(function (row) {
        var exercises = [];
        try {
            // 讀取隱藏的 RAW JSON
            if (row['raw_json']) {
                var parsed = JSON.parse(row['raw_json']);
                exercises = parsed.exercises || [];
            }
        } catch (e) { }

        return {
            id: row['ID'] || row.id,
            studentId: row['學員ID'] || row.studentId,
            date: row['日期'] || row.date,
            coachNotes: row['教練筆記'] || row.coachNotes,
            exercises: exercises,
            recordedStats: {
                weight: row['記錄體重'] || row.stat_weight,
                bodyFat: row['記錄體脂'] || row.stat_bodyFat,
                injuries: row['記錄傷病'] || row.stat_injuries
            }
        };
    });

    return ContentService.createTextOutput(JSON.stringify({
        students: assembledStudents,
        workouts: assembledWorkouts
    })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    try {
        var jsonString = e.postData.contents;
        var data = JSON.parse(jsonString);
        var ss = SpreadsheetApp.getActiveSpreadsheet();

        if (data.students) {
            saveStudentsChinese(ss.getSheetByName("Students"), data.students);
        }

        if (data.workouts) {
            saveWorkoutsChinese(ss.getSheetByName("Workouts"), data.workouts);
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

    // 定義中文欄位
    var headers = [
        'ID', '姓名', '角色', '分類',
        '身高', '體重', '體脂', '傷病', '目標', '更新時間'
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    var rows = students.map(function (s) {
        var st = s.stats || {};
        return [
            s.id, s.name, s.role, s.category,
            st.height, st.weight, st.bodyFat, st.injuries, st.goals, st.updatedAt
        ];
    });

    writeToSheet(sheet, headers, rows);
}

function saveWorkoutsChinese(sheet, workouts) {
    if (!workouts || workouts.length === 0) return;

    // 定義中文欄位
    var headers = [
        'ID', '學員ID', '日期', '教練筆記',
        '訓練摘要', // summary_content
        '類型',     // type_tag
        '記錄體重', '記錄體脂', '記錄傷病',
        'raw_json'  // 此欄位保持英文識別
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    var rows = workouts.map(function (w) {
        var stats = w.recordedStats || {};
        var exercises = w.exercises || [];

        var summary = "";
        var typeTag = "其他";

        if (exercises.length > 0) {
            var first = exercises[0];
            if (first.stroke) {
                typeTag = "游泳";
                summary = exercises.map(function (e) { return "[" + e.stroke + "] " + (e.progress || ""); }).join("\n");
            } else if (first.isStrengthTraining !== undefined) {
                typeTag = "拳擊";
                summary = exercises.map(function (e) { return (e.isStrengthTraining ? "[肌力] " : "[技術] ") + (e.combinations || ""); }).join("\n");
            } else if (first.weight !== undefined) {
                typeTag = "健身";
                summary = exercises.map(function (e) { return e.name + ": " + e.weight + "kg x " + e.reps + " x " + e.sets; }).join("\n");
            }
        }

        var rawJson = JSON.stringify({ exercises: w.exercises });

        return [
            w.id, w.studentId, w.date, w.coachNotes,
            summary, typeTag,
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
