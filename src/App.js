import 'bootstrap/dist/css/bootstrap.css'
import './App.css';
import { Container, Card,  CardBody, CardTitle, Button, CardText, Row, Col, CardImg } from 'reactstrap';
import { useState, useEffect } from 'react';
import { API } from 'aws-amplify';

/**
 * サムネイル画像
 */
export function ProductThumbnail({product}) {
    const thumbnail = product && product.images ? product.images[0]: null
    if (!thumbnail) return null;
    return (
      <CardImg top width="100%" src={thumbnail} alt={product.caption} />
    )
}

function App() {
  const [apiResponse, setApiResponse] = useState([]);
  useEffect(() => {
    API.get('stripeapi', '/shop/products')
      .then(data => {
        setApiResponse(data);
      }).catch(e => {
        setApiResponse(e);
      });
  }, []);
  if (apiResponse instanceof Error) {
    return (
      <div className="App">
        <h1>Error: {apiResponse.name}</h1>
        <p>{apiResponse.message}</p>
      </div>
    )
  }
  return (
    <div className="App">
      <Container>
        <Row md="3">
          {apiResponse.map((product, i) => (
            <Col key={product.id}>
              <Card>
                <CardBody>
                  <ProductThumbnail product={product} />
                  <CardTitle>{product.name}</CardTitle>
                  <CardText>{product.description}</CardText>
                  {product.prices.map(price => (
                    <Button key={price.id} block>
                      {`${price.unit_amount.toLocaleString()} ${price.currency.toLocaleUpperCase()}`}
                      {price.recurring ? (
                        <>
                          {` / per ${price.recurring.interval_count} ${price.recurring.interval}`}
                        </>
                      ): null}
                    </Button>
                  ))}
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default App;

