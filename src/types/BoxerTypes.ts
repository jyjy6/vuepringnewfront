export interface Boxer {
  id: number; // primary key
  division: string;
  name: string;
  rating: number;
  bouts: number | null;
  rounds: number | null;
  ko: string;
  career: string;
  debut: string;
  title: string;
  birthname: string; // @JsonProperty("birthname")에 대응
  sex: string;
  age: number | null;
  country: string;
  stance: string;
  reach: string;
  height: string;
  birthplace: string; // @JsonProperty("birthplace")에 대응
  author: string;
  ranking: number | null;
  createdAt?: string; // Java LocalDateTime -> ISO 문자열 ("2025-03-26T12:00:00")
  boxerImg: string;
}
