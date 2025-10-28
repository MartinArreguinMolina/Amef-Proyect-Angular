export class DateFormater {
    static getDDMMMMYYYY(date: string): string {
      return date.replaceAll('/', '-');
    }
}
