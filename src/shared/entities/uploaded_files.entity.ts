import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('uploaded_files')
export class UploadedFile {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    path?: string;

    @CreateDateColumn()
    uploaded_at!: Date;
}