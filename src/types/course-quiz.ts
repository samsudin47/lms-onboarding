/** Bank soal pilihan ganda (pre/post) — selaras dengan journey peserta. */
export type CourseQuizOption = { id: string; text: string }
export type CourseQuizQuestion = {
  id: string
  text: string
  options: CourseQuizOption[]
  correct: string
}
