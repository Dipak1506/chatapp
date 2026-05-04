export const checkEmail = (email) => {
    const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (!email || email.length === 0) return false;
    if (!validRegex.test(email)) return false;
    return true;
};

// FIX: Previous regex required BOTH letters AND numbers — "John" or "Alice" would fail.
// Updated to: 3–30 chars, letters/numbers/underscores/hyphens, must start with a letter.
export const checkUsername = (username) => {
    if (!username || username.length === 0) return false;
    if (username.length < 3 || username.length > 30) return false;

    const validRegex = /^[a-zA-Z][a-zA-Z0-9_-]{2,29}$/;
    return validRegex.test(username);
};

// FIX: Added password strength validator (was completely missing)
export const checkPassword = (password) => {
    if (!password || password.length < 6) return false;
    return true;
};

// export const formatTime = (timeStr) => {
//     if (!timeStr) return '';
 
//     const [hours, minutes] = timeStr.split(':');
//     let hour = parseInt(hours, 10);
//     if (isNaN(hour)) return '';
 
//     const ampm = hour >= 12 ? 'PM' : 'AM';
//     hour = hour % 12 || 12;          
//     return `${hour}:${minutes} ${ampm}`;
// };


export const formatTime = (timeStr) => {
    if (!timeStr) return '';

    let date;

    // Full ISO/timestamp string (e.g. "2026-04-28T03:40:00.000Z")
    if (timeStr.includes('T') || timeStr.includes('-')) {
        date = new Date(timeStr);
    } else {
        // Plain "HH:MM:SS" from DB — treat as UTC today, then add IST offset
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);
        if (isNaN(h)) return '';

        // Add IST offset (+5:30 = 330 minutes) manually
        const totalMinutes = h * 60 + m + 330;
        const istHour = Math.floor(totalMinutes / 60) % 24;
        const istMin = totalMinutes % 60;
        const ampm = istHour >= 12 ? 'PM' : 'AM';
        const displayHour = istHour % 12 || 12;
        return `${displayHour}:${String(istMin).padStart(2, '0')} ${ampm}`;
    }

    if (isNaN(date.getTime())) return '';

    return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
    });
};