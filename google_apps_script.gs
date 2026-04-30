const RESULTS_SHEET_NAME = 'Results';
const ADMIN_EMAILS = ['mohsen.adelfar@gmail.com', 'mohsen.adelfar@hiab.com'];

function setupInventoryGameResultsSheet() {
  const sheet = getResultsSheet_();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(getHeaders_());
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = getResultsSheet_();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(getHeaders_());
    }

    const playerResult = findPolicy_(payload.report_summary, 'Player') || {};
    const baselineRop4 = findPolicy_(payload.report_summary, 'Baseline ROP 4') || {};
    const baselineRop12 = findPolicy_(payload.report_summary, 'Baseline ROP 12') || {};

    sheet.appendRow([
      new Date(),
      payload.player_name || '',
      payload.player_email || '',
      payload.item || '',
      payload.scenario || '',
      payload.lead_time_mode || '',
      payload.months_played || '',
      payload.final_rop || '',
      payload.eoq || '',
      payload.service_level || '',
      payload.total_inventory_cost || '',
      payload.total_backlog_cost || '',
      payload.cumulative_total_cost || '',
      playerResult['Average Stock'] || '',
      playerResult['Average Pipeline'] || '',
      playerResult['Inventory Cost'] || '',
      playerResult['Backlog Cost'] || '',
      playerResult['Total Cost'] || '',
      playerResult['Fill Rate'] || '',
      baselineRop4['Total Cost'] || '',
      baselineRop4['Fill Rate'] || '',
      baselineRop12['Total Cost'] || '',
      baselineRop12['Fill Rate'] || '',
      JSON.stringify(payload.report_summary || []),
    ]);

    const subject = `Inventory Game Report - ${payload.scenario || 'Scenario'}`;
    const playerHtml = payload.report_html || buildFallbackHtml_(payload);

    if (payload.player_email) {
      MailApp.sendEmail({
        to: payload.player_email,
        subject: subject,
        htmlBody: playerHtml,
      });
    }

    MailApp.sendEmail({
      to: ADMIN_EMAILS.join(','),
      subject: `${subject} - ${payload.player_name || 'Player'}`,
      htmlBody: playerHtml,
    });

    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error) });
  }
}

function getResultsSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(RESULTS_SHEET_NAME) || spreadsheet.insertSheet(RESULTS_SHEET_NAME);
}

function getHeaders_() {
  return [
    'Timestamp',
    'Player Name',
    'Player Email',
    'Item',
    'Scenario',
    'Lead Time Mode',
    'Months Played',
    'Final ROP',
    'EOQ',
    'Service Level %',
    'Total Inventory Cost',
    'Total Backlog Cost',
    'Cumulative Total Cost',
    'Player Average Stock',
    'Player Average Pipeline',
    'Player Inventory Cost',
    'Player Backlog Cost',
    'Player Total Cost',
    'Player Fill Rate %',
    'Baseline ROP 4 Total Cost',
    'Baseline ROP 4 Fill Rate %',
    'Baseline ROP 12 Total Cost',
    'Baseline ROP 12 Fill Rate %',
    'Report Summary JSON',
  ];
}

function findPolicy_(summary, policyName) {
  summary = summary || [];
  for (let i = 0; i < summary.length; i++) {
    if (summary[i].Policy === policyName) {
      return summary[i];
    }
  }
  return null;
}

function buildFallbackHtml_(payload) {
  return `
    <div style="font-family:Arial,sans-serif;">
      <h2>Inventory Game Report</h2>
      <p><strong>Player:</strong> ${escapeHtml_(payload.player_name || '')}</p>
      <p><strong>Scenario:</strong> ${escapeHtml_(payload.scenario || '')}</p>
      <p><strong>Service level:</strong> ${escapeHtml_(String(payload.service_level || ''))}%</p>
      <p><strong>Total cost:</strong> ${escapeHtml_(String(payload.cumulative_total_cost || ''))}</p>
    </div>
  `;
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function jsonResponse_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
