export class User {
    userId:number;
    username:string;
    nickname:string;
    roleId:number;
    
    public constructor(userId:number = 0, username:string = '', nickname:string = '', roleId:number = 0) {
        this.userId = userId;
        this.username = username;
        this.nickname = nickname;
        this.roleId = roleId;
    }
}