// Student Up - Final Advanced Version (Fully Flattened)
// 這個版本會將所有資料「展開」成獨立欄位，讓您在 Google Sheets 能夠直接閱讀、篩選與分析。

function doGet(e) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var students = readSheet(ss.getSheetByName("Students"));
    var workouts = readSheet(ss.getSheetByName("Workouts"));

    // 為了讓 App 能讀回資料，我們需要把展開的欄位組裝回原本的物件格式
    var assembledStudents = students.map(function (row) {
        return {
            id: row.id,
            name: row.name,
            role: row.role,
            category: row.category,
            stats: {
                height: row.height,
                weight: row.weight,
                bodyFat: row.bodyFat,
                injuries: row.injuries,
                goals: row.goals,
                updatedAt: row.updatedAt
            }
        };
    });

    var assembledWorkouts = workouts.map(function (row) {
        var exercises = [];
        try {
            // 嘗試讀取原始 JSON (如果有存的話) 或者從摘要欄位重建 (較難，這裡我們依賴一個 hidden json column 或是簡化處理)
            // 為了保持簡單與相容性，我們讀取資料時，主要依賴 App 寫入的 "raw_data" 備份欄位 (如果我們設計有的話)
            // 但為了讓 Excel 好看，我們通常犧牲一點讀取的完美性，或者是存兩份: 一份給人用(展開)，一份給機器用(JSON)
            // 這裡採用策略：存兩份。最後一欄放 JSON 給程式讀，前面欄位給人看。
            if (row.raw_json) {
                var parsed = JSON.parse(row.raw_json);
                exercises = parsed.exercises || [];
            }
        } catch (e) { }

        return {
            id: row.id,
            studentId: row.studentId,
            date: row.date,
            coachNotes: row.coachNotes,
            exercises: exercises,
            recordedStats: {
                weight: row.stat_weight,
                bodyFat: row.stat_bodyFat,
                injuries: row.stat_injuries
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
            saveStudentsAdvanced(ss.getSheetByName("Students"), data.students);
        }

        if (data.workouts) {
            saveWorkoutsAdvanced(ss.getSheetByName("Workouts"), data.workouts);
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

function saveStudentsAdvanced(sheet, students) {
    if (!students || students.length === 0) return;

    // 定義人類可讀的欄位 (包含 nested stats)
    var headers = [
        'id', 'name', 'role', 'category',
        'height', 'weight', 'bodyFat', 'injuries', 'goals', 'updatedAt'
    ];

    // 更新標題
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

function saveWorkoutsAdvanced(sheet, workouts) {
    if (!workouts || workouts.length === 0) return;

    // 定義人類可讀的欄位 + 最後一欄放 raw_json 給程式還原用
    var headers = [
        'id', 'studentId', 'date', 'coachNotes',
        'summary_content', // 訓練內容摘要 (文字)
        'type_tag',        // 運動類型標籤 (自動判斷)
        'stat_weight', 'stat_bodyFat', 'stat_injuries', // 當次記錄的身體數值
        'raw_json'         // [隱藏欄位] 完整資料備份 (程式讀取用)
    ];

    // 更新標題
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    var rows = workouts.map(function (w) {
        var stats = w.recordedStats || {};
        var exercises = w.exercises || [];

        // 產生人類可讀的摘要
        var summary = "";
        var typeTag = "Other";

        if (exercises.length > 0) {
            // 判斷類型與格式化內容
            var first = exercises[0];
            if (first.stroke) { // 游泳
                typeTag = "Swimming";
                summary = exercises.map(function (e) { return "[" + e.stroke + "] " + (e.progress || ""); }).join("\n");
            } else if (first.isStrengthTraining !== undefined) { // 拳擊
                typeTag = "Boxing";
                summary = exercises.map(function (e) { return (e.isStrengthTraining ? "[肌力] " : "[技術] ") + (e.combinations || ""); }).join("\n");
            } else if (first.weight !== undefined) { // 健身
                typeTag = "Workout";
                summary = exercises.map(function (e) { return e.name + ": " + e.weight + "kg x " + e.reps + " x " + e.sets; }).join("\n");
            }
        }

        // 為了不管是讀取還是手動查看都方便，我們把完整資料存一份在 raw_json
        // 但 App 讀取時會優先解析 raw_json 以獲得最精確的資料結構
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
