export class User {
    id:number;
    username:string;
    nickname:string;
    roleId:number;
    
    public constructor(id:number = 0, username:string = '', nickname:string = '', roleId:number = 0) {
        this.id = id;
        this.username = username;
        this.nickname = nickname;
        this.roleId = roleId;
    }
}