import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Contact} from './entities/contact.entity';
import {ContactService} from './contact.service';
import {ContactController} from './contact.controller';
import {User} from '../auth/entities/user.entity';
import {ChatModule} from '../chat/chat.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Contact, User]),
        ChatModule,
    ],
    providers: [ContactService],
    controllers: [ContactController],
})
export class ContactModule {
}
