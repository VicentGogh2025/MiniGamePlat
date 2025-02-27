export class UserData {
    id: number;
    email: string;
    phoneNumber: string;
    countrycode: string;
    flagUrl: string;
    phoneCode: string;
    username: string;
    password: string;
    nickname: string;
    avatar: string;
    invitationCode: string;
    agent: number;
    coins: number;
    token: string;
    created_at: string;
    level: number;
    paypassword: string;

    constructor(
        id: number,
        email: string,
        phoneNumber: string,
        countrycode: string,
        flagUrl: string,
        phoneCode: string,
        username: string,
        password: string,
        nickname: string,
        avatar: string,
        invitationCode: string,
        agent: number,
        coins: number,
        token: string,
        created_at: string,
        level: number,
        paypassword: string
    ) {
        this.id = id;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.countrycode = countrycode;
        this.flagUrl = flagUrl;
        this.phoneCode = phoneCode;
        this.username = username;
        this.password = password;
        this.nickname = nickname;
        this.avatar = avatar;
        this.invitationCode = invitationCode;
        this.agent = agent;
        this.coins = coins;
        this.token = token;
        this.created_at = created_at;
        this.level = level;
        this.paypassword = paypassword;
    }

    static fromJSON(json: any): UserData {
       // const json = JSON.parse(jsonString);
        return new UserData(
            json.id,
            json.email,
            json.phoneNumber,
            json.countrycode,
            json.flagUrl,
            json.phoneCode,
            json.username,
            json.password,
            json.nickname,
            json.avatar,
            json.invitationCode,
            json.agent,
            json.coins,
            json.token,
            json.created_at,
            json.level,
            json.paypassword
        );
    }

    toJSON(): string {
        return JSON.stringify({
            id: this.id,
            email: this.email,
            phoneNumber: this.phoneNumber,
            countrycode: this.countrycode,
            flagUrl: this.flagUrl,
            phoneCode: this.phoneCode,
            username: this.username,
            password: this.password,
            nickname: this.nickname,
            avatar: this.avatar,
            invitationCode: this.invitationCode,
            agent: this.agent,
            coins: this.coins,
            token: this.token,
            created_at: this.created_at,
            level: this.level,
            paypassword: this.paypassword
        });
    }
}