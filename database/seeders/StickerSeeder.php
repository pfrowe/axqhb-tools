<?php

namespace Database\Seeders;

use App\Models\Singer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StickerSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    function sendStickers($singer, $singers)
    {
      $recipientParts = [
        'tenor' => ['lead', 'bari'],
        'lead' => ['bari', 'bass'],
        'bari' => ['bass'],
        'bass' => ['tenor']
      ];
      $recipients = array_filter(
        $singers,
        fn ($singerTest) => (in_array($singerTest['voice_part'], $recipientParts[$singer['voice_part']]))
      );
      $recipients = array_filter($recipients, fn () => (rand(0, 99) < 25));
      foreach ($recipients as $recipient)
      {
        $statuses = [
          0 => 'declined',
          5 => 'pending',
          25 => 'accepted'
        ];
        $statusRandom = rand(0, 99);
        $statusSticker = '';
        foreach ($statuses as $chance => $statusTest)
        {
          if ($statusRandom >= $chance)
          {
            $statusSticker = $statusTest;
          }
        }
        DB::table('stickers')->insert([
          'created_at' => now(),
          'recipient_id' => $recipient['id'],
          'sender_id' => $singer['id'],
          'status' => $statusSticker,
          'updated_at' => now()
        ]);
      }
    }
    $singers = Singer::all()->toArray();
    foreach ($singers as $singerSeed)
    {
      sendStickers($singerSeed, $singers);
    }
  }
}
