export default function convertTime(time: string): string{
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) as string;
}