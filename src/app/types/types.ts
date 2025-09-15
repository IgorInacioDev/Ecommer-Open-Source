import { ReactNode } from "react";

export type InfoSection = {
  title: string;
  content: string;
}

export type Thumbnail = {
  signedPath: string;
}

export type Thumbnails = {
  tiny: Thumbnail;
  small: Thumbnail;
  card_cover: Thumbnail;
}

export type ImageType = {
  path: string;
  title: string;
  mimetype: string;
  size: number;
  width: number;
  height: number;
  id: string;
  thumbnails: Thumbnails;
  signedPath: string;
  url:string
}

export type VideoReview = {
  id: string;
  path: string;
  title: string;
  mimetype: string;
  size: number;
  signedPath: string;
}

export type Order = {
  Id: number;
  status: string;
}

export type PrizeType = {
  name: string
  title: string
}

export interface InfoProps{
  title:string;
  description: ReactNode;
}