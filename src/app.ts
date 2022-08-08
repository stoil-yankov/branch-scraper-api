import axios from 'axios';
import express, { Request, Response } from 'express';
import path from 'path';
import { ApiService } from './application/ApiService';
import { SerpApiService } from './application/SerpApiService';

export const app = async (): Promise<void> => {
  const app = express();
  const port = 3000;

  app.use(express.static(__dirname + '../public'));
  app.set('views', path.join(__dirname, '../views'));
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');

  const client = axios.create();
  const locationsService = new ApiService(client);
  const serpApiService = new SerpApiService(client);

  app.get('/',(req: Request, res: Response) => {
    res.render('index.html');
  });

  app.get('/tomtom/iatas', async (req: Request, res: Response) => {
    try { 
         const result = await locationsService.getIatasWithCoordinates();
         
         return result;
    }
    catch(error: any){
          console.log('Error: ', error);
          return error;
    }
  })

  app.get('/tomtom/addresses', async (req: Request, res: Response) => {
    try { 
         const result = await locationsService.getLocationByCoordinates();
         
         return result;
    }
    catch(error: any){
          console.log('Error: ', error);
          return error;
    }
  })

  app.get('/serp/addresses', async (req: Request, res: Response) => {
    try {
         const limit = Number(req.query.limit) || 500;
         const offset = Number(req.query.offset) || 0;
         const result = await serpApiService.getAddresses(offset, limit);
         
         return res.status(200).send(result);
    }
    catch(error: any){
          console.log('Error: ', error);
          return error;
    }
  })

  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
  });
};

app();