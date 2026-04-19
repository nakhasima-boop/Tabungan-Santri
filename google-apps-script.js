/**
 * Google Apps Script for SantriTabung
 * Deploy as Web App, set access to "Anyone"
 */

// If you find errors like "Cannot find spreadsheet", replace the line below with:
// const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const getSS = () => {
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    // If not bound, you must provide ID
    // return SpreadsheetApp.openById('YOUR_ID');
    throw new Error("Spreadsheet not found. Please ensure script is bound or provide ID.");
  }
};

const SHEET_SISWA = "siswa";
const SHEET_TRANSAKSI = "transaksi";
const SHEET_ADMIN = "admin";

const getSheet = (name) => {
  const ss = getSS();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === SHEET_ADMIN) {
      sheet.appendRow(["username", "name", "password", "role"]);
      sheet.appendRow(["admin", "Administrator", "admin123", "admin"]);
    }
  }
  return sheet;
};

function doGet(e) {
  const action = e.parameter.action;
  const ss = getSS();
  
  try {
    if (action === "getAdmins") {
      const sheet = getSheet(SHEET_ADMIN);
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) return jsonResponse([]);
      
      const headers = data[0].map(h => h.toString().toLowerCase().trim());
      const admins = data.slice(1).map(row => {
        let obj = {};
        headers.forEach((h, i) => {
          if (h !== "password") obj[h] = row[i];
        });
        return obj;
      });
      return jsonResponse(admins);
    }
    if (action === "getSiswa") {
      const sheet = getSheet(SHEET_SISWA);
      const data = sheet.getDataRange().getValues();
      if (data.length === 0) return jsonResponse([]);
      
      const headers = data[0].map(h => h.toString().toLowerCase().trim());
      const q = e.parameter.q ? e.parameter.q.toLowerCase() : "";
      
      const students = data.slice(1)
        .map(row => {
          let obj = {};
          headers.forEach((h, i) => obj[h] = row[i]);
          return obj;
        })
        .filter(s => {
          if (!q) return true;
          return s.nama.toLowerCase().includes(q) || s.nis.toString().toLowerCase().includes(q);
        });
      return jsonResponse(students);
    }
    
    if (action === "getTransaksi") {
      const sheet = getSheet(SHEET_TRANSAKSI);
      const data = sheet.getDataRange().getValues();
      if (data.length === 0) return jsonResponse([]);
      
      const headers = data[0].map(h => h.toString().toLowerCase().trim());
      
      const type = e.parameter.type;
      const startDate = e.parameter.startDate;
      const endDate = e.parameter.endDate;
      const studentId = e.parameter.studentId;
      const q = e.parameter.q ? e.parameter.q.toLowerCase() : "";
      
      // We need student names to search by q if q is provided
      let studentsMap = {};
      if (q) {
        const sSheet = getSheet(SHEET_SISWA);
        const sData = sSheet.getDataRange().getValues().slice(1);
        sData.forEach(row => studentsMap[row[0]] = row[2].toLowerCase());
      }

      const txs = data.slice(1)
        .map(row => {
          let obj = {};
          headers.forEach((h, i) => obj[h] = row[i]);
          return obj;
        })
        .filter(t => {
          let match = true;
          if (type && t.jenis !== type) match = false;
          if (studentId && t.id_siswa !== studentId) match = false;
          
          if (startDate || endDate) {
            const tDate = new Date(t.tanggal).getTime();
            if (startDate && tDate < new Date(startDate).getTime()) match = false;
            if (endDate && tDate > new Date(endDate + "T23:59:59").getTime()) match = false;
          }

          if (q) {
            const sName = studentsMap[t.id_siswa] || "";
            if (!sName.includes(q)) match = false;
          }

          return match;
        });
      return jsonResponse(txs);
    }

    if (action === "getDashboard") {
      const siswaSheet = getSheet(SHEET_SISWA);
      const txSheet = getSheet(SHEET_TRANSAKSI);
      const siswaData = siswaSheet.getDataRange().getValues().slice(1);
      const txData = txSheet.getDataRange().getValues().slice(1);
      
      const totalSaldo = siswaData.reduce((acc, row) => acc + (Number(row[4]) || 0), 0);
      const jumlahSiswa = siswaData.length;
      
      const headersTx = txSheet.getDataRange().getValues()[0].map(h => h.toString().toLowerCase().trim());
      const jenisIdx = headersTx.indexOf("jenis");
      const nominalIdx = headersTx.indexOf("nominal");
      
      const totalPenarikan = txData.reduce((acc, row) => {
        if (row[jenisIdx] === "penarikan") {
          return acc + (Number(row[nominalIdx]) || 0);
        }
        return acc;
      }, 0);
      
      return jsonResponse({ totalSaldo, jumlahSiswa, totalPenarikan });
    }
    
    return jsonResponse({ error: "Invalid action" });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

function doPost(e) {
  const ss = getSS();
  let params;
  
  try {
    params = JSON.parse(e.postData.contents);
  } catch (err) {
    // If not JSON, try e.parameter
    params = e.parameter;
  }
  
  const action = params.action;
  
  try {
    if (action === "addSiswa") {
      const sheet = getSheet(SHEET_SISWA);
      const newId = Utilities.getUuid();
      sheet.appendRow([newId, params.nis, params.nama, params.kelas, 0, params.foto || ""]);
      return jsonResponse({ success: true, id: newId });
    }
    
    if (action === "updateSiswa") {
      const sheet = getSheet(SHEET_SISWA);
      const data = sheet.getDataRange().getValues();
      const headers = data[0].map(h => h.toString().toLowerCase().trim());
      const fotoIdx = headers.indexOf("foto");
      const idToUpdate = String(params.id_siswa).trim();

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === idToUpdate) {
          sheet.getRange(i + 1, 2).setValue(params.nis);
          sheet.getRange(i + 1, 3).setValue(params.nama);
          sheet.getRange(i + 1, 4).setValue(params.kelas);
          
          if (fotoIdx !== -1) {
             sheet.getRange(i + 1, fotoIdx + 1).setValue(params.foto || "");
          } else {
             // Add photo column if missing
             sheet.getRange(1, headers.length + 1).setValue("foto");
             sheet.getRange(i + 1, headers.length + 1).setValue(params.foto || "");
          }
          return jsonResponse({ success: true, message: "Data santri berhasil diperbarui" });
        }
      }
      return jsonResponse({ error: "Santri tidak ditemukan untuk update" }, 404);
    }
    
    if (action === "deleteSiswa") {
      const sheetSiswa = getSheet(SHEET_SISWA);
      const sheetTx = getSheet(SHEET_TRANSAKSI);
      const dataSiswa = sheetSiswa.getDataRange().getValues();
      const idToDelete = String(params.id_siswa).trim();
      
      // Delete from student sheet
      let deleted = false;
      for (let i = 1; i < dataSiswa.length; i++) {
        if (String(dataSiswa[i][0]).trim() === idToDelete) {
          sheetSiswa.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }
      
      if (!deleted) return jsonResponse({ error: "Santri tidak ditemukan" }, 404);
      
      // Cleanup transactions for this student
      const dataTx = sheetTx.getDataRange().getValues();
      // Iterate backwards to delete rows safely
      for (let j = dataTx.length - 1; j >= 1; j--) {
        if (String(dataTx[j][1]).trim() === idToDelete) {
          sheetTx.deleteRow(j + 1);
        }
      }
      
      return jsonResponse({ success: true, message: "Santri dan seluruh riwayat transaksi berhasil dihapus" });
    }
    
    if (action === "addTransaksi") {
      const txSheet = getSheet(SHEET_TRANSAKSI);
      const siswaSheet = getSheet(SHEET_SISWA);
      const newTxId = Utilities.getUuid();
      const date = new Date().toISOString();
      const nominal = Number(params.nominal);
      
      // Append Tx
      txSheet.appendRow([newTxId, params.id_siswa, date, params.jenis, nominal]);
      
      // Update Saldo
      const dataSiswa = siswaSheet.getDataRange().getValues();
      for (let i = 1; i < dataSiswa.length; i++) {
        if (dataSiswa[i][0] == params.id_siswa) {
          let currentSaldo = Number(dataSiswa[i][4]) || 0;
          let newSaldo = params.jenis === "setoran" ? currentSaldo + nominal : currentSaldo - nominal;
          siswaSheet.getRange(i + 1, 5).setValue(newSaldo);
          break;
        }
      }
      
      return jsonResponse({ success: true });
    }

    if (action === "updateAdmin") {
      const sheet = getSheet(SHEET_ADMIN);
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == params.username) {
          if (params.newNama) sheet.getRange(i + 1, 2).setValue(params.newNama);
          if (params.newPassword) sheet.getRange(i + 1, 3).setValue(params.newPassword);
          return jsonResponse({ success: true });
        }
      }
      return jsonResponse({ error: "Admin tidak ditemukan" }, 404);
    }

    if (action === "addAdmin") {
      const sheet = getSheet(SHEET_ADMIN);
      sheet.appendRow([params.username, params.name, params.password, "admin"]);
      return jsonResponse({ success: true });
    }
    
    return jsonResponse({ error: "Invalid POST action" });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
