export class User {
    id:string;
    username:string;
    originalUsername:string;
    password:string;
    salt:string;
    email:string;
    role:string;
    createTime:string;
    updateTime:string;
    
    public constructor(){
        this.id = '';
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