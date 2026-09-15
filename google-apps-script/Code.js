/* eslint-disable no-unused-vars */
/**
 * ============================================================================
 * WEDDING RSVP - GOOGLE APPS SCRIPT BACKEND
 * Tarun & Manya Wedding Website
 * ============================================================================
 * 
 * Google Sheet Columns:
 * Column A: Timestamp
 * Column B: Full Name
 * Column C: Number of Guests
 * Column D: Events Attending
 * Column E: RSVP Status
 * 
 * INSTRUCTIONS FOR DEPLOYMENT:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any code in Code.gs and paste this entire file.
 * 4. Run setupSheet() once to initialize the sheet headers (optional but recommended).
 * 5. Click "Deploy" > "New deployment".
 * 6. Select type: "Web app".
 * 7. Set:
 *    - Description: "Wedding RSVP API"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone" (crucial for public website submissions)
 * 8. Click "Deploy", authorize permissions when prompted.
 * 9. Copy the "Web app URL" and use it in your website configuration.
 */

// Target Sheet Name (Default: first active sheet or specify name)
var SHEET_NAME = 'RSVPs';

/**
 * Handle HTTP GET Requests (Health Check)
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'success',
      message: 'Wedding RSVP Web App is active and ready to receive submissions.'
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP POST Requests (RSVP Form Submissions)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  
  try {
    // Acquire script lock for up to 15 seconds to prevent race conditions & duplicate rows
    lock.waitLock(15000);

    // 1. Verify and Parse Incoming Payload
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        status: 'error',
        message: 'No data received in request.'
      });
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createJsonResponse({
        status: 'error',
        message: 'Invalid JSON payload.'
      });
    }

    // 2. Validate Full Name
    var rawName = payload.fullName || payload.name || '';
    var fullName = String(rawName).trim();
    if (!fullName) {
      return createJsonResponse({
        status: 'error',
        message: 'Full Name cannot be empty.'
      });
    }
    if (fullName.length > 120) {
      return createJsonResponse({
        status: 'error',
        message: 'Full Name exceeds maximum permitted length.'
      });
    }

    // 3. Validate Events Attending & Determine RSVP Status
    var rawEvents = payload.eventsAttending || payload.events || [];
    if (!Array.isArray(rawEvents)) {
      if (typeof rawEvents === 'string' && rawEvents.trim()) {
        rawEvents = [rawEvents.trim()];
      } else {
        rawEvents = [];
      }
    }

    // Check if guest indicated they are not attending
    var isNotAttending = Boolean(payload.notAttending) || 
      (typeof payload.rsvpStatus === 'string' && payload.rsvpStatus.toLowerCase().indexOf('not attending') !== -1) ||
      rawEvents.some(function(item) {
        var str = String(item).toLowerCase();
        return str.indexOf('not attending') !== -1 || 
               str.indexOf('not be attending') !== -1 || 
               str.indexOf('will not') !== -1;
      });

    var rsvpStatus = '';
    var eventsString = '';
    var numberOfGuests = 0;

    if (isNotAttending) {
      rsvpStatus = 'Not Attending';
      eventsString = 'I will not be attending';
      numberOfGuests = 0;
    } else {
      // Attending validation
      rsvpStatus = 'Attending';

      // Clean event names
      var cleanedEvents = rawEvents
        .map(function(ev) { return String(ev).trim(); })
        .filter(function(ev) { return ev.length > 0; });

      if (cleanedEvents.length === 0) {
        return createJsonResponse({
          status: 'error',
          message: 'Please select at least one event you will be attending.'
        });
      }

      eventsString = cleanedEvents.join(', ');

      // Validate Number of Guests
      var rawGuests = payload.numberOfGuests !== undefined ? payload.numberOfGuests : payload.guests;
      numberOfGuests = parseInt(rawGuests, 10);

      if (isNaN(numberOfGuests) || numberOfGuests < 1) {
        return createJsonResponse({
          status: 'error',
          message: 'Number of Guests must be a valid number of at least 1.'
        });
      }
      if (numberOfGuests > 20) {
        return createJsonResponse({
          status: 'error',
          message: 'Number of Guests exceeds maximum limit of 20.'
        });
      }
    }

    // 4. Generate Server-Side Timestamp (Timezone of the spreadsheet/script)
    var timezone = Session.getScriptTimeZone() || 'Asia/Kolkata';
    var timestamp = Utilities.formatDate(new Date(), timezone, 'yyyy-MM-dd HH:mm:ss');

    // 5. Access Google Sheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.getActiveSheet();
    }

    // Ensure header row exists if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Full Name', 'Number of Guests', 'Events Attending', 'RSVP Status']);
    }

    // 6. Append Row to Sheet
    // Columns: A: Timestamp | B: Full Name | C: Number of Guests | D: Events Attending | E: RSVP Status
    sheet.appendRow([
      timestamp,
      fullName,
      numberOfGuests,
      eventsString,
      rsvpStatus
    ]);

    SpreadsheetApp.flush();

    // 7. Return JSON Success Response
    return createJsonResponse({
      status: 'success',
      message: 'Thank you, your RSVP has been received.'
    });

  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: 'Server error processing RSVP: ' + err.toString()
    });
  } finally {
    // Release the lock
    lock.releaseLock();
  }
}

/**
 * Helper to build JSON responses with appropriate headers
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Optional Setup Function:
 * Run this once inside Apps Script to format the spreadsheet headers nicely.
 */
function setupSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.getActiveSheet();
    sheet.setName(SHEET_NAME);
  }

  var headers = ['Timestamp', 'Full Name', 'Number of Guests', 'Events Attending', 'RSVP Status'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format header row
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#9B7378'); // Dusty rose matching wedding theme
  headerRange.setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);

  // Set friendly column widths
  sheet.setColumnWidth(1, 180); // Timestamp
  sheet.setColumnWidth(2, 220); // Full Name
  sheet.setColumnWidth(3, 140); // Number of Guests
  sheet.setColumnWidth(4, 320); // Events Attending
  sheet.setColumnWidth(5, 150); // RSVP Status
}
