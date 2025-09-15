export type TrackingSession = {
  sessionId?: string;
  visitCount?: number;
  pageViews?: number;
  firstVisit?: string;
  lastVisit?: string;
};

export type TrackingPerformance = {
  loadTime?: number;
  connectionType?: string;
  downlink?: number;
};

export type TrackingUTM = { [key: string]: string };

export type TrackingData = {
  utm?: TrackingUTM;
  session?: TrackingSession;
  performance?: TrackingPerformance;
  fingerprint?: Record<string, unknown>;
};