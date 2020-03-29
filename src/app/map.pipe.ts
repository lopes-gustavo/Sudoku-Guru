import { Pipe, PipeTransform } from '@angular/core';

type KeyValue<K, V> = { key: K, value: V };

@Pipe({
  name: 'map'
})
export class MapPipe implements PipeTransform {
  transform<K, V>(map: Map<K, V>): KeyValue<K, V>[] {
    const out: KeyValue<K, V>[] = [];
    map.forEach((value, key) => out.push({ key, value }));
    return out;
  }
}
