import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import {Container, Card, CardBody, CardTitle, Button, CardText, Row, Col} from 'reactstrap';

const products = [{
  title: '商品1',
  description: '商品説明文',
  price: 100,
}, {
  title: '商品2',
  description: '商品説明文',
  price: 150,
}, {
  title: '商品3',
  description: '商品説明文',
  price: 200,
}]

function App() {
  return (
    <div className="App">
        <Container>
          <Row md="3">
            {products.map((product, i) => (
                <Col key={i}>
                  <Card>
                    <CardBody>
                      <CardTitle>{product.title}</CardTitle>
                      <CardText>{product.description}</CardText>
                      <Button>注文する ({product.price} 円)</Button>
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
