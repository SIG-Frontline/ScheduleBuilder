export default function convertTime(time: string, h12: boolean = true): string {
    const formattedTime = new Date(time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return h12 ? formattedTime.replace(/ AM| PM/, "") : formattedTime;
}
