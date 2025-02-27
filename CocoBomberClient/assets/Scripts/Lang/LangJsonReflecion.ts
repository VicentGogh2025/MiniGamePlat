export class LangBasic {
    languagecode: string;
    nativeName: string;
    flagUrl: string;
    phoneCode: string;
    countryCode: string;
    countryName: string;
    chineseName: string;
    currencyCode: string;
    currencySymbol: string;

    constructor(
        languagecode: string,
        nativeName: string,
        flagUrl: string,
        phoneCode: string,
        countryCode: string,
        countryName: string,
        chineseName: string,
        currencyCode: string,
        currencySymbol: string
    ) {
        this.languagecode = languagecode;
        this.nativeName = nativeName;
        this.flagUrl = flagUrl;
        this.phoneCode = phoneCode;
        this.countryCode = countryCode;
        this.countryName = countryName;
        this.chineseName = chineseName;
        this.currencyCode = currencyCode;
        this.currencySymbol = currencySymbol;

    }

    static fromJSON(json:any): LangBasic {
       // const json = JSON.parse(jsonString);
        return new LangBasic(
            json.languagecode,
            json.nativeName,
            json.flagUrl,
            json.phoneCode,
            json.countryCode,
            json.countryName,
            json.chineseName,
            json.currencyCode,
            json.currencySymbol
        );
    }
}

