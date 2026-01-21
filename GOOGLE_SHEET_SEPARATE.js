// Student Up - Separate Sheets Version
// 游泳、拳擊、健身分開工作表 + 中文表頭 + 隱藏欄位優化

function doGet(e) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    // Read Students
    var students = readSheet(ss.getSheetByName("Students"));

    // Read Workouts from 3 separate sheets
    var workoutsFit = readSheet(ss.getSheetByName("Workouts_Fitness") || ss.insertSheet("Workouts_Fitness"));
    var workoutsSwim = readSheet(ss.getSheetByName("Workouts_Swimming") || ss.insertSheet("Workouts_Swimming"));
    var workoutsBox = readSheet(ss.getSheetByName("Workouts_Boxing") || ss.insertSheet("Workouts_Boxing"));

    // Merge all workouts
    var allWorkouts = flattenWorkouts(workoutsFit)
        .concat(flattenWorkouts(workoutsSwim))
        .concat(flattenWorkouts(workoutsBox));

    // Assemble Students
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

// Convert sheet row to workout object
function flattenWorkouts(rows) {
    return rows.map(function (row) {
        var exercises = [];
        try {
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
            // Split workouts by type
            var fit = [], swim = [], box = [];

            data.workouts.forEach(function (w) {
                var first = (w.exercises && w.exercises[0]) || {};
                if (first.stroke) swim.push(w);
                else if (first.isStrengthTraining !== undefined) box.push(w);
                else fit.push(w);
            });

            // Save to separate sheets
            if (fit.length > 0) saveWorkoutsChinese(ss.getSheetByName("Workouts_Fitness") || ss.insertSheet("Workouts_Fitness"), fit, "Fitness");
            if (swim.length > 0) saveWorkoutsChinese(ss.getSheetByName("Workouts_Swimming") || ss.insertSheet("Workouts_Swimming"), swim, "Swimming");
            if (box.length > 0) saveWorkoutsChinese(ss.getSheetByName("Workouts_Boxing") || ss.insertSheet("Workouts_Boxing"), box, "Boxing");
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

function saveWorkoutsChinese(sheet, workouts, type) {
    if (!workouts || workouts.length === 0) return;

    // Custom headers based on type can be added here if needed, but keeping unified structure is easier
    var headers = [
        'ID', '學員ID', '日期', '教練筆記',
        '訓練摘要', // summary_content
        '記錄體重', '記錄體脂', '記錄傷病',
        'raw_json'  // Hiding recommended
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Hide the last column (raw_json) to make it cleaner
    sheet.hideColumns(headers.length);

    var rows = workouts.map(function (w) {
        var stats = w.recordedStats || {};
        var exercises = w.exercises || [];
        var summary = "";

        if (exercises.length > 0) {
            if (type === "Swimming") {
                summary = exercises.map(function (e) { return "[" + e.stroke + "] " + (e.progress || ""); }).join("\n");
            } else if (type === "Boxing") {
                summary = exercises.map(function (e) { return (e.isStrengthTraining ? "[肌力] " : "[技術] ") + (e.combinations || ""); }).join("\n");
            } else {
                summary = exercises.map(function (e) { return e.name + ": " + e.weight + "kg x " + e.reps + " x " + e.sets; }).join("\n");
            }
        }

        var rawJson = JSON.stringify({ exercises: w.exercises });
        return [
            w.id, w.studentId, w.date, w.coachNotes,
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
