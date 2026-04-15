import { SALT_ROUND } from "../../../config/config.js";
import { compare, genSalt, hash } from 'bcrypt';


export const generateHash = async ({
    plaintext,
    salt = SALT_ROUND,

}: {
    plaintext: string
    , salt?: number
}): Promise<string> => {
    const generateSalt = await genSalt(salt);

    return await hash(plaintext, generateSalt);
};


export const compareHash = async ({ plaintext, ciphertext }
    : {
        plaintext: string
        ciphertext: string
    }): Promise<boolean> => {

    const match = await compare(plaintext, ciphertext);
    return match;
}
