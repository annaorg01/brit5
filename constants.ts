export const API_BASE_URL = "https://sheets-connector.vercel.app";
export const API_PROJECT_PATH = "/api/v1/projects/59b69a56-9ffa-4fbb-a34b-34c121aac520/tables/lid";
export const API_KEY = "2YyP9m83ob2fyt3FgWAC34rWZXFlPEU2";
export const BATCH_SIZE = 1000;
export const MAX_RETRIES = 5;

// Field names from the API
export const FIELDS = {
    SOURCE: "PROVIDER",
    AGENT: "Campaign agent name",
    STATUS: "Last appointment status",
    CAMPAIGN: "Marketing Campaign name",
    INTERESTED_IN: "שם המוצר",
    CREATED_AT: "Campaign created at",
    LAST_SOURCE: "Last source",
    PRODUCT_TYPE: "סוג מוצר",
};

export const FILTER_DISPLAY_NAMES: { [key: string]: string } = {
    [FIELDS.SOURCE]: "ספק (Provider)",
    [FIELDS.AGENT]: "מתאם (Agent)",
    [FIELDS.STATUS]: "סטטוס פגישה (Status)",
    [FIELDS.CAMPAIGN]: "קמפיין",
    [FIELDS.INTERESTED_IN]: "שם המוצר (Interested In)",
    [FIELDS.CREATED_AT]: "תאריך יצירה (Date Range)",
    [FIELDS.PRODUCT_TYPE]: "לקוח מתעניין",
};

export const OPTION_DISPLAY_MAP: { [key: string]: { [key: string]: string } } = {};

export const STATUS_DISPLAY_MAP: { [key: string]: string } = {
    'Occurred': 'פגישות שהתקיימו',
    'Scheduled': 'פגישות עתידיות',
    'Canceled': 'פ- פגישות שבוטלו',
    'לא מעוניין': 'ל- לא מעוניין',
    'Rescheduled': 'R - Rescheduled',
    'Confirmed': 'A - Confirmed',
};

export const STATUS_SORT_ORDER: { [key: string]: number } = {
    'Occurred': 1,
    'Scheduled': 2,
    'Canceled': 3,
    'לא מעוניין': 4,
};

export const AGENT_NOT_DEFINED = "לא הוגדר מתאם";
export const STATUS_NOT_DEFINED = "לא מעוניין";
export const SOURCE_NOT_DEFINED = "לא הוגדר ספק";
export const LAST_SOURCE_NOT_DEFINED = "ללא מקור אחרון";
export const INTERESTED_IN_NOT_DEFINED = "לא הוגדר מוצר";
export const PRODUCT_TYPE_NOT_DEFINED = "לא הוגדר סוג מוצר";

export const HEADER_TOOLTIPS: { [key: string]: { field: string; logic: string; } } = {
    agent: {
        field: `"${FIELDS.AGENT}"`,
        logic: "מציג את שם המתאם המשויך לליד. לידים ללא מתאם מקובצים תחת 'לא הוגדר מתאם'."
    },
    totalLeads: {
        field: "ספירה מחושבת",
        logic: "סך כל הלידים המשויכים למתאם, בהתבסס על המסננים הפעילים כעת."
    },
    status_template: {
        field: `"${FIELDS.STATUS}"`,
        logic: "מציג את האחוז והכמות של לידים עם סטטוס '{status}' מתוך סך הלידים של המתאם. החישוב מתבצע כך: (כמות לידים בסטטוס זה / סך כל הלידים) * 100."
    }
};
