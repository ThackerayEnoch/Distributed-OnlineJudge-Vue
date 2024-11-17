export class User {
    userId:string;
    username:string;
    originalUsername:string;
    password:string;
    salt:string;
    email:string;
    role:string;
    createTime:string;
    updateTime:string;
    
    public constructor(){
        this.userId = '';
        this.username = '';
        this.originalUsername = '';
        this.password = '';
        this.salt = '';
        this.email = '';
        this.role = '';
        this.createTime = '';
        this.updateTime = '';
    }
}