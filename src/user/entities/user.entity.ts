import { Column, Entity } from "typeorm";
import { base } from "./base.entity";

@Entity()
export class User extends base{
    @Column()
    name: string;

    @Column({unique:true})
    email: string;

    @Column()
    password: string;
  role: any;
}
