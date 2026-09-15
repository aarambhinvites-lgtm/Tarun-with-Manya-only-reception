/**
 * Configuration settings for the wedding website.
 * 
 * You can set the RSVP Google Apps Script URL either by:
 * 1. Defining VITE_RSVP_GOOGLE_SCRIPT_URL in your .env file
 * 2. OR pasting the deployed Google Apps Script Web App URL directly in the fallback string below.
 */
export const RSVP_GOOGLE_SCRIPT_URL = 
  import.meta.env.VITE_RSVP_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwb9v_C4LMBWIYMLSFZ6pdeuWPPcCJAiX4E_QHpESixGdpUM_JmqKFWVUevOfsbt-VJ/exec';
