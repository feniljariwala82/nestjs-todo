type UserMetaDataType = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
};

declare namespace Express {
  export interface Request {
    user?: Partial<UserMetaDataType>;
  }
}
