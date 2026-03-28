"user server"

export async function Registeruser(formData: FormData) {
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    if (!username || !email || !password) {
        throw new Error("Missing Fields")
    }

    console.log(username,email,password)
}