export interface Member {
  id: number;
  name: string;
  profileImage?: string | null;
  group: {
    id: number;
    name: string;
  } | null;
  status: {
    level: number;
    exp: number;
    maxExp: number;
  };
  type: 'SOCIAL';
}
