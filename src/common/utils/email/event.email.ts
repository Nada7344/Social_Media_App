import {EventEmitter} from 'node:events'

export const emailEvent =new EventEmitter({});

emailEvent.on("SendEmail", async(fun)=>{
    try {
        await fun()
    } catch (error) {
        console.log(`fail in email event ${error}`)
    }
})