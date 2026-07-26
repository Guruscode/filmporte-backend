import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Purchase } from '../../purchases/entities/purchase.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  ticketPrice: number;

  @Column({ nullable: true })
  posterUrl: string;

  @Column({ default: false })
  @Index()
  isPublished: boolean;

  @ManyToOne(() => User, (user) => user.movies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'producerId' })
  producer: User;

  @Column()
  producerId: string;

  @OneToMany(() => Purchase, (purchase) => purchase.movie)
  purchases: Purchase[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
