import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class AppService {
  private _redis: Redis;
  private _redisSub: Redis;

  constructor() {
    this._redis = new Redis();
    this._redisSub = new Redis();
    //this.sendMessage();
    //this.subscribeMessage();
    this.executeGroupCommand();
  }


  public async testSetGet(): Promise<void> {
    if (this._redis.status !== "connecting") {
      return; //todo
    }
    await this._redis.set("mykey", "value", "EX", 50);
    this._redis.get("mykey", (err, result) => {
      if (err) {
        console.error(err);
      } else {
        console.log(result);
      }
    });
    const value = await this._redis.get("mykey");
  }

  public async executeGroupCommand(): Promise<void> {
    let result;
    result = await this._redis.pipeline()//конвеер
      .set("foo", "bar")
      .del("cc")
      .exec();
    //[null, "OK"]
    //[null, 0]

    result = await this._redis.multi({ pipeline: false });//транзакция
    //"OK"
    result = await this._redis.set("foo", "bar");
    //"QUEUED"
    result = await this._redis.del("cc");
    //"QUEUED"
    result = await this._redis.exec();
    //[null, "OK"]
    //[null, 0]

    result = await this._redis.multi()//транзакция в конвеере
      .set("foo", "bar")
      .del("cc")
      .exec();
    //[null, "OK"]
    //[null, 0]
  }

  private sendMessage(): void {
    setInterval(() => {
      const message = { time: new Date().toISOString() };
      const channel = 'my-channel-1';
      this._redis.publish(channel, JSON.stringify(message));
    }, 1000);
  }

  private subscribeMessage(): void {
    this._redisSub.subscribe("my-channel-1", (err: Error, channelCount) => {
      if (err) {
        console.error("Failed to subscribe: %s", err.message);
      } else {
        console.log(
          `Subscribed successfully! This client is currently subscribed to ${channelCount} channels.`
        );
      }
    });

    this._redisSub.on("message", (channel, message) => {
      console.log(`Received ${message} from ${channel}`);
    });
  }
}
