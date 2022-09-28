export function dateFormat(date) {
    var dateObject = new Date(date);
    let day = dateObject.getDay().toString();
    let month = ((dateObject.getMonth())+1).toString();
    let year = dateObject.getFullYear().toString().substr(-2);
    let hours = dateObject.getHours().toString();
    let minutes = dateObject.getMinutes().toString();
    return (day+'/'+month+'/'+year+" "+hours+":"+minutes)
};