import {nativeCapabilities} from './localOdysseus';
afterEach(()=>{delete global.fetch;});
test('connection failures are described in words the user can act on',async()=>{
 await expect(nativeCapabilities('not a url','u','')).rejects.toThrow('Wpisz pełny adres Odysseusa');
 global.fetch=jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
 await expect(nativeCapabilities('https://ody.test','u','')).rejects.toThrow('Brak odpowiedzi z tego adresu');
 global.fetch=jest.fn().mockResolvedValue({ok:false,status:401,json:async()=>({})});
 await expect(nativeCapabilities('https://ody.test','u','')).rejects.toThrow('Wpisz token dostępu albo zaloguj się');
 await expect(nativeCapabilities('https://ody.test','u','ody_x')).rejects.toThrow('Odysseus odrzucił token');
 global.fetch=jest.fn().mockResolvedValue({ok:false,status:502,json:async()=>{throw new SyntaxError('html');}});
 await expect(nativeCapabilities('https://ody.test','u','')).rejects.toThrow('Odysseus odpowiedział błędem (502)');
});
